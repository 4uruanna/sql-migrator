/**
 * Handles the status command for the SQL migrator CLI.
 * This module provides functionality to display the current state of migrations,
 * including which migrations have been executed and which are pending.
 */
import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

/**
 * Displays the status of all migrations.
 * Shows two tables:
 * 1. Database history - migrations that have been executed
 * 2. Pending migrations - migrations that have not been executed yet
 * @param migrator - The database migrator instance to use for retrieving migration status.
 * @returns A promise that resolves when the status is displayed.
 */
export const statusCommand = async function (
  migrator: DatabaseMigrator,
): Promise<void> {
  // Get all local migrations
  let localHistory = (await migrator.initialize())
    .map((m) => m.history);

  // Get database history
  const historyArray = await migrator.history();
  const timestampMap = new Map<number, true>();

  // Create a map of executed migration timestamps
  for (const history of historyArray) {
    timestampMap.set(history.timestamp.valueOf(), true);
  }

  // Filter to get only pending migrations
  localHistory = localHistory.filter((h) =>
    timestampMap.has(h.timestamp.valueOf()) === false
  );

  // Display database history
  console.log("Database history (executed migrations)");
  console.table(
    historyArray,
    ["timestamp", "name", "migrate_at"],
  );

  // Display pending migrations
  console.log("\nPending migrations");
  console.table(
    localHistory,
    ["timestamp", "name"],
  );
};
