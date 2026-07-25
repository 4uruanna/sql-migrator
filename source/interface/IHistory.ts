/**
 * Represents a migration history record stored in the database.
 * This interface defines the structure of migration history entries
 * that track which migrations have been executed and when.
 */
export interface IHistory {
  /**
   * The unique identifier for the history record (auto-incremented by the database).
   */
  id?: number;

  /**
   * The timestamp when the migration was created.
   * Used to determine the order of migrations.
   */
  timestamp: Date;

  /**
   * The name of the migration (extracted from the filename).
   */
  name: string;

  /**
   * The SQL query that was executed for this migration.
   */
  query: string;

  /**
   * The timestamp when the migration was executed.
   * Automatically set by the database on insertion.
   */
  migrate_at?: Date;
}
