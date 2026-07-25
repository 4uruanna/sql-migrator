/**
 * Handles the migrate command for the SQL migrator CLI.
 * This module provides functionality to execute pending migrations,
 * either all or up to a specific timestamp.
 */
import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

/**
 * Executes pending migrations.
 * Applies migrations in chronological order (oldest first).
 * @param migrator - The database migrator instance to use for migration operations.
 * @param to - Optional timestamp prefix to migrate to. If provided, only migrations
 *             with timestamp <= to will be executed. Format: YYYYMMDDHHMM
 * @returns A promise that resolves when all migrations are complete.
 * @throws Error if any migration fails.
 */
export const migrateCommand = async function (
  migrator: DatabaseMigrator,
  to?: string
): Promise<void> {
  // Initialize and get all migrations
  const migrations = await migrator.initialize();
  const history = await migrator.history();
  const timestampMap = new Map<number, true>();

  // Create a map of executed migration timestamps
  for (const h of history) {
    timestampMap.set(h.timestamp.valueOf(), true);
  }

  // Filter to get only pending migrations
  let migrationsToRun = migrations.filter(
    (m) => !timestampMap.has(m.history.timestamp.valueOf()),
  );

  // If --to option is provided, filter to only migrations <= the specified timestamp
  if (to) {
    const toTimestamp = new Date(to).valueOf();
    migrationsToRun = migrationsToRun.filter(
      (m) => m.history.timestamp.valueOf() <= toTimestamp,
    );
  }

  // Execute migrations
  await migrator.migrate(migrationsToRun);
};
