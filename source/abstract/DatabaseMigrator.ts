import type { IMigration } from "../interface/IMigration.ts";
import type { Database, Client } from "@4uruanna/sql-connector";
import * as fs from "@std/fs";
import * as path from "@std/path";
import * as zod from "zod";
import CONSTANTS from "../constant.ts";
import type { HistoryRepository } from "./HistoryRepository.ts";
import type { IHistory } from "../interface/IHistory.ts";

/**
 * Abstract base class for database migration operations.
 * This class provides the core functionality for executing SQL migrations,
 * including migrate, rollback, and history operations.
 */
export abstract class DatabaseMigrator {
  /**
   * Creates a new DatabaseMigrator instance.
   * @param _database - The database connection instance.
   * @param _repository - The history repository instance for storing migration records.
   * @param _schema - The database schema where migrations should be applied.
   */
  protected constructor(
    private readonly _database: Database,
    private readonly _repository: HistoryRepository,
    private readonly _schema: string
  ) {
  }

  /**
   * Executes the up migrations for the given list of migrations.
   * Each migration is executed in a transaction to ensure atomicity.
   * If a migration fails, all changes are rolled back.
   * @param migrations - Array of migrations to execute.
   * @returns A promise that resolves when all migrations are executed.
   * @throws Error if any migration fails.
   */
  public async migrate(migrations: IMigration[]): Promise<void> {
    const client = await this._database.createClient();
    const failedMigrations: string[] = [];

    for (const migration of migrations) {
      if (CONSTANTS.MIGRATION_FILENAME_REGEX.test(migration.filename) === false) {
        throw new Error(`Invalid migration filename: ${migration.filename}`);
      }
      console.table([migration], ["filename"]);
      try {
        await client.query("BEGIN");
        await client.query(migration.migration.up());
        await this._repository.insert(migration.history, client);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        failedMigrations.push(migration.filename);
        await client.dispose();
        throw new Error(
          `Migration failed: ${migration.filename}\nError: ${(error as Error).message}`,
        );
      }
    }

    await client.dispose();
  }

  /**
   * Executes the down migrations (rollbacks) for the given list of migrations.
   * Each migration is rolled back individually.
   * @param migrations - Array of migrations to rollback (should be in reverse order).
   * @returns A promise that resolves when all rollbacks are complete.
   */
  public async rollback(migrations: IMigration[]): Promise<void> {
    let client: Client | undefined;

    for (const migration of migrations) {
      try {
        console.table([migration.history], ["timestamp", "name"]);
        client = await this._database.createClient();
        await client.query(migration.migration.down());
        await client.dispose();
        client = undefined;
        await this._repository.deleteByTimestamp(migration.history.timestamp);
      } catch (error) {
        console.error(error);
      } finally {
        await client?.dispose();
      }
    }
  }

  /**
   * Retrieves the migration history from the database.
   * @returns A promise that resolves to an array of IHistory objects.
   */
  public history(): Promise<IHistory[]> {
    return this._repository.findAll();
  }

  /**
   * Initializes the migrator by ensuring the SQL directory exists
   * and the history table is created in the database.
   * @returns A promise that resolves to an array of IMigration objects
   *          that can be migrated or rolled back.
   */
  public async initialize(): Promise<IMigration[]> {
    if (fs.existsSync(CONSTANTS.DIRECTORY.SQL) === false) {
      Deno.mkdirSync(CONSTANTS.DIRECTORY.SQL);
    }

    await this._repository.initialize(this._schema);

    return await this._loadMigrations();
  }

  /**
   * Loads all migration files from the SQL directory.
   * Each file is expected to export a default object with up() and down() methods.
   * @returns A promise that resolves to an array of IMigration objects,
   *          sorted by timestamp in ascending order.
   * @private
   */
  private async _loadMigrations(): Promise<IMigration[]> {
    const result: IMigration[] = [];
    const fileArray: IteratorObject<Deno.DirEntry> = Deno.readDirSync(
      CONSTANTS.DIRECTORY.SQL,
    );

    for (const file of fileArray) {
      if (file.isFile && file.name.toLowerCase().endsWith(".ts")) {
        const absolute: string = path.join(CONSTANTS.DIRECTORY.SQL, file.name);
        const href: string = path.toFileUrl(absolute).href;
        const migration = (await import(href)).default as { up(): string, down(): string };

        result.push({
          filename: zod.string().min(16).parse(file.name),
          migration,
          history: {
            name: file.name.substring(13, file.name.length - 3),
            query: migration.up(),
            timestamp: this._checkTimestamp(file.name),
          },
        });
      }
    }

    return result.sort((a, b) =>
      a.history.timestamp.valueOf() - b.history.timestamp.valueOf()
    );
  }

  /**
   * Extracts and validates the timestamp from a migration filename.
   * The timestamp is expected to be in the format: YYYYMMDDHHMM
   * @param filename - The migration filename to parse.
   * @returns The Date object representing the timestamp.
   * @throws Error if the timestamp is invalid.
   * @private
   */
  private _checkTimestamp(filename: string): Date {
    const date: string = zod
      .number()
      .min(100001010000)
      .parse(Number(filename.substring(0, 12)))
      .toString();

    return new Date(
      Date.UTC(
        Number(date.substring(0, 4)),
        Number(date.substring(4, 6)) - 1,
        Number(date.substring(6, 8)),
        Number(date.substring(8, 10)),
        Number(date.substring(10, 12)),
        0,
        0,
      ),
    );
  }
}
