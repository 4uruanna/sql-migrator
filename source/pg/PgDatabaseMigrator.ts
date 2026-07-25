/**
 * PostgreSQL implementation of the DatabaseMigrator.
 * This class extends the abstract DatabaseMigrator with PostgreSQL-specific
 * functionality for executing migrations.
 */
import { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";
import type { Database } from "@4uruanna/sql-connector";
import type { HistoryRepository } from "../abstract/HistoryRepository.ts";

export class PgDatabaseMigrator extends DatabaseMigrator {
  /**
   * Creates a new PgDatabaseMigrator instance.
   * @param database - The PostgreSQL database connection.
   * @param repository - The history repository for storing migration records.
   * @param schema - The database schema where migrations should be applied.
   */
  public constructor(database: Database, repository: HistoryRepository, schema: string) {
    super(database, repository, schema);
  }
}
