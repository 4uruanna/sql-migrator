import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

export const migrateCommand = async function (
  migrator: DatabaseMigrator,
): Promise<void> {
  let migrationArray = await migrator.initialize();
  const historyArray = await migrator.history();
  const timestampMap = new Map<number, true>();

  for(const history of historyArray) {
    timestampMap.set(history.timestamp.valueOf(), true);
  }

  migrationArray = migrationArray.filter((migration) => {
    return timestampMap.has(migration.history.timestamp.valueOf()) === false
  });

  await migrator.migrate(migrationArray);
};
