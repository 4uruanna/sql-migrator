/**
 * Represents a migration file with its metadata and SQL queries.
 * This interface defines the structure of a migration that can be executed.
 */
import type { IHistory } from "./IHistory.ts";

export interface IMigration {
  /**
   * The filename of the migration (e.g., "202401010000_create_users.ts").
   * Must match the pattern: YYYYMMDDHHMM_description.ts
   */
  filename: string;

  /**
   * The migration object containing the SQL queries for up and down operations.
   */
  migration: {
    /**
     * Returns the SQL query to apply the migration (e.g., CREATE TABLE).
     * @returns The SQL query string for the up migration.
     */
    up(): string;

    /**
     * Returns the SQL query to rollback the migration (e.g., DROP TABLE).
     * @returns The SQL query string for the down migration.
     */
    down(): string;
  };

  /**
   * The history metadata associated with this migration.
   */
  history: IHistory;
}
