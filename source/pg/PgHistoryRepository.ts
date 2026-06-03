import CONSTANTS from "../constant.ts";
import type { IQuery, PgQueryBuilder } from "@jackofblades/sql-query-builder";
import type { IHistory } from "../interface/IHistory.ts";
import type { IClient, PgDatabase } from "@jackofblades/sql-connector";
import { HistoryRepository } from "../abstract/HistoryRepository.ts";

export class PgHistoryRepository extends HistoryRepository {
  private readonly _queryBuilder: PgQueryBuilder;
  private readonly _database: PgDatabase;

  public constructor(
    database: PgDatabase,
    queryBuilder: PgQueryBuilder,
  ) {
    super();
    this._database = database;
    this._queryBuilder = queryBuilder;
  }

  public override async insert(history: IHistory): Promise<void> {
    const client: IClient = await this._database.createClient();
    const query: IQuery = this._queryBuilder
      .insert()
      .into(CONSTANTS.TABLE)
      .columns("name", "timestamp", "query")
      .values(history.name, history.timestamp, history.query)
      .build();

    try {
      const result = await client.query<IHistory>(
        query.query,
        query.parameters.map((v) => v.value)
      );

      if (result.rowCount) {
        Object.assign(history, result.rows[0]);
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await client.dispose();
    }
  }

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

      if (queryResult.rowCount) {
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

  public override async initialize(): Promise<void> {
    const client: IClient = await this._database.createClient();
    const query: string = "" +
      `CREATE TABLE IF NOT EXISTS ${CONSTANTS.TABLE} (` +
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

  public override async deleteByTimestamp(timestamp: Date): Promise<void> {
    const client: IClient = await this._database.createClient();
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

      if (queryResult.rowCount) {
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
