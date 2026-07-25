import { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";
import type { Database } from "@4uruanna/sql-connector";
import type { HistoryRepository } from "../abstract/HistoryRepository.ts";

export class PgDatabaseMigrator extends DatabaseMigrator {
  public constructor(database: Database, repository: HistoryRepository, schema: string) {
    super(database, repository, schema);
  }
}
