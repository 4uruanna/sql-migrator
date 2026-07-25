/**
 * Handles the rollback command for the SQL migrator CLI.
 * This module provides functionality to revert executed migrations,
 * either all or up to a specific timestamp.
 */
import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

/**
 * Executes rollback for migrations.
 * Reverts migrations in reverse order (most recent first).
 * @param migrator - The database migrator instance to use for rollback operations.
 * @param to - Optional timestamp prefix to rollback to. If provided, only migrations
 *             with timestamp >= to will be rolled back. Format: YYYYMMDDHHMM
 * @returns A promise that resolves when all rollbacks are complete.
 */
export const rollbackCommand = async function (
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

  // Filter to get only executed migrations
  let migrationsToRun = migrations.filter(
    (m) => timestampMap.has(m.history.timestamp.valueOf()),
  );

  // If --to option is provided, filter to only migrations >= the specified timestamp
  if (to) {
    const toTimestamp = new Date(to).valueOf();
    migrationsToRun = migrationsToRun.filter(
      (m) => m.history.timestamp.valueOf() >= toTimestamp,
    );
  }

  // Execute rollback in reverse order (most recent first)
  await migrator.rollback(migrationsToRun.reverse());
};
