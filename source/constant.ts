/**
 * Application constants and configuration values.
 * This module exports constants used throughout the application,
 * including directory paths, table names, and regex patterns.
 */
import * as path from "@std/path";

const CWD = Deno.cwd();

/**
 * Application constants object.
 */
const CONSTANTS = {
  /**
   * Regular expression for validating migration filenames.
   * Format: YYYYMMDDHHMM_description.ts
   * Example: 202401010000_create_users.ts
   */
  MIGRATION_FILENAME_REGEX: /^\d{12}\.[a-zA-Z0-9_]+\.ts$/,

  /**
   * The current working directory.
   */
  CWD,

  /**
   * Directory paths used by the application.
   */
  DIRECTORY: {
    /**
     * The path to the SQL migrations directory.
     * Defaults to a 'sql' subdirectory in the current working directory.
     */
    SQL: path.resolve(CWD, "sql"),
  },

  /**
   * The name of the migration history table in the database.
   */
  TABLE: "sql_history",
};

export default CONSTANTS;
