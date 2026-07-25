import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

// Dans migrate.command.ts, implémenter --to
export const migrateCommand = async function (
  migrator: DatabaseMigrator,
  to?: string
): Promise<void> {
  const migrations = await migrator.initialize();
  const history = await migrator.history();
  const timestampMap = new Map<number, true>();

  for (const h of history) {
    timestampMap.set(h.timestamp.valueOf(), true);
  }

  let migrationsToRun = migrations.filter(
    (m) => !timestampMap.has(m.history.timestamp.valueOf()),
  );

  if (to) {
    const toTimestamp = new Date(to).valueOf();
    migrationsToRun = migrationsToRun.filter(
      (m) => m.history.timestamp.valueOf() <= toTimestamp,
    );
  }

  await migrator.migrate(migrationsToRun);
};