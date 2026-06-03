import { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";
import type { IMigration } from "../interface/IMigration.ts";
import type { IHistory } from "../interface/IHistory.ts";
import type { Database } from "@jackofblades/sql-connector";
import type {HistoryRepository} from "../abstract/HistoryRepository.ts";

export class PgDatabaseMigrator extends DatabaseMigrator {
  public constructor(database: Database, repository: HistoryRepository) {
    super(database, repository);
  }
}
