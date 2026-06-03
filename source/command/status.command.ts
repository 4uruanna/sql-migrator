import type { DatabaseMigrator } from "../abstract/DatabaseMigrator.ts";

export const statusCommand = async function (migrator: DatabaseMigrator): Promise<void> {
  let localHistory = (await migrator.initialize())
    .map((m) => m.history);

  const historyArray = await migrator.history();
  const timestampMap = new Map<number, true>();

  for(const history of historyArray) {
    timestampMap.set(history.timestamp.valueOf(), true);
  }

  localHistory = localHistory.filter((h) => timestampMap.has(h.timestamp.valueOf()) === false)

  console.log("Database history");

  console.table(
    historyArray,
    ["timestamp", "name", "migrate_at"],
  );

  console.log("Migration");

  console.table(
    localHistory,
    ["timestamp", "name"],
  );
};
