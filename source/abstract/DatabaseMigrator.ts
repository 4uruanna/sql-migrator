import type { IMigration, Migration } from "../interface/IMigration.ts";
import type { Database, IClient } from "@jackofblades/sql-connector";
import * as fs from "@std/fs";
import * as path from "@std/path";
import * as zod from "zod";
import CONSTANTS from "../constant.ts";
import type { HistoryRepository } from "./HistoryRepository.ts";
import type { IHistory } from "../interface/IHistory.ts";

export abstract class DatabaseMigrator {
  protected readonly _database: Database;

  protected readonly _repository: HistoryRepository;

  protected constructor(database: Database, repository: HistoryRepository) {
    this._database = database;
    this._repository = repository;
  }

  public async migrate(migrations: IMigration[]): Promise<void> {
    let client: IClient|undefined;

    for (const migration of migrations) {
      try {
      client = await this._database.createClient();
      console.table([migration.history], ["timestamp", "name"]);
      await client.query(migration.migration.up());
      await client.dispose();
      client = undefined;
      await this._repository.insert(migration.history);
      } catch (error) {
        console.error(error);
      } finally {
        await client?.dispose();
      }
    }
  }

  public async rollback(migrations: IMigration[]): Promise<void> {
    let client: IClient|undefined;

    for (const migration of migrations) {
      try {
        client = await this._database.createClient();
        console.table([migration.history], ["timestamp", "name"]);
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

  public history(): Promise<IHistory[]> {
    return this._repository.findAll();
  }

  public async initialize(): Promise<IMigration[]> {
    if (fs.existsSync(CONSTANTS.DIRECTORY.SQL) === false) {
      Deno.mkdirSync(CONSTANTS.DIRECTORY.SQL);
    }

    await this._repository.initialize();

    return await this._loadMigrations();
  }

  private async _loadMigrations(): Promise<IMigration[]> {
    const result: IMigration[] = [];
    const fileArray: IteratorObject<Deno.DirEntry> = Deno.readDirSync(
      CONSTANTS.DIRECTORY.SQL,
    );

    for (const file of fileArray) {
      if (file.isFile && file.name.toLowerCase().endsWith(".ts")) {
        const absolute: string = path.join(CONSTANTS.DIRECTORY.SQL, file.name);
        const href: string = path.toFileUrl(absolute).href;
        const migration = (await import(href)).default as Migration;

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

    return result.sort((a, b) => a.history.timestamp.valueOf() - b.history.timestamp.valueOf());
  }

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
