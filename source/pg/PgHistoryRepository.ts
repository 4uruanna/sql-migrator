/**
 * PostgreSQL implementation of the HistoryRepository.
 * This class provides concrete implementations for storing and retrieving
 * migration history records in a PostgreSQL database.
 */
import CONSTANTS from "../constant.ts";
import type { IQuery, PgQueryBuilder } from "@4uruanna/sql-query-builder";
import type { IHistory } from "../interface/IHistory.ts";
import type { Client, PgDatabase } from "@4uruanna/sql-connector";
import { HistoryRepository } from "../abstract/HistoryRepository.ts";

export class PgHistoryRepository extends HistoryRepository {
  /**
   * The query builder instance for constructing SQL queries.
   */
  private readonly _queryBuilder: PgQueryBuilder;

  /**
   * The database connection instance.
   */
  private readonly _database: PgDatabase;

  /**
   * Creates a new PgHistoryRepository instance.
   * @param database - The PostgreSQL database connection.
   * @param queryBuilder - The query builder for constructing SQL queries.
   */
  public constructor(
    database: PgDatabase,
    queryBuilder: PgQueryBuilder,
  ) {
    super();
    this._database = database;
    this._queryBuilder = queryBuilder;
  }

  /**
   * Inserts a new migration history record into the database.
   * @param history - The history record to insert.
   * @param client - The database client to use for the insertion.
   * @returns A promise that resolves when the insertion is complete.
   * @throws Error if the insertion fails.
   */
  public override async insert(history: IHistory, client: Client): Promise<void> {
    const query: IQuery = this._queryBuilder
      .insert()
      .into(CONSTANTS.TABLE)
      .columns("name", "timestamp", "query")
      .values(history.name, history.timestamp, history.query)
      .build();

    try {
      const queryResult = await client.query<IHistory>(
        query.query,
        query.parameters.map((v) => v.value),
      );

      if (queryResult.rows.length) {
        Object.assign(history, queryResult.rows[0]);
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }
  }

  /**
   * Retrieves all migration history records from the database.
   * @returns A promise that resolves to an array of IHistory objects,
   *          ordered by timestamp in ascending order.
   */
  public override async findAll(): Promise<IHistory[]> {
    const client = await this._database.createClient();
    const result: IHistory[] = [];
    const query = this._queryBuilder
      .select()
      .from(CONSTANTS.TABLE)
      .orderBy("timestamp", "ASC")
      .build();

    try {
      const queryResult = await client.query<IHistory>(query.query);

      if (queryResult.rows.length) {
        result.push(...queryResult.rows);
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }

    return result;
  }

  /**
   * Initializes the migration history table in the database.
   * Creates the sql_history table with the required schema.
   * @param schema - The database schema where the history table should be created.
   * @returns A promise that resolves when the table is created.
   * @throws Error if the table creation fails.
   */
  public override async initialize(schema: string): Promise<void> {
    const client: Client = await this._database.createClient();
    const query: string = "" +
      `CREATE TABLE IF NOT EXISTS ${schema}.${CONSTANTS.TABLE} (` +
      "id SERIAL PRIMARY KEY," +
      "name VARCHAR(255) UNIQUE NOT NULL," +
      "timestamp TIMESTAMP UNIQUE NOT NULL," +
      "query TEXT NOT NULL," +
      "migrate_at TIMESTAMP NOT NULL DEFAULT NOW()" +
      ")";

    try {
      await client.query<IHistory>(query);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }
  }

  /**
   * Deletes a migration history record by its timestamp.
   * @param timestamp - The timestamp of the record to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Error if the deletion fails.
   */
  public override async deleteByTimestamp(timestamp: Date): Promise<void> {
    const client: Client = await this._database.createClient();
    const query: IQuery = this._queryBuilder
      .delete()
      .setParameter(timestamp)
      .from(CONSTANTS.TABLE)
      .where("timestamp = $1")
      .build();

    try {
      await client.query<IHistory>(
        query.query,
        query.parameters.map((v) => v.value),
      );
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }
  }

  /**
   * Retrieves the most recent migration history record.
   * @returns A promise that resolves to the last IHistory object,
   *          or null if no records exist.
   */
  public override async findLast(): Promise<IHistory | null> {
    const client = await this._database.createClient();
    let result: IHistory | null = null;
    const query = this._queryBuilder
      .select()
      .from(CONSTANTS.TABLE)
      .orderBy("timestamp", "DESC")
      .limit(1)
      .build();

    try {
      const queryResult = await client.query<IHistory>(query.query);

      if (queryResult.rows.length) {
        result = queryResult.rows[0];
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }

    return result;
  }
}
