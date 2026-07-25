import { helpCommand } from "./command/help.command.ts";
import { statusCommand } from "./command/status.command.ts";
import { migrateCommand } from "./command/migrate.command.ts";
import { rollbackCommand } from "./command/rollback.command.ts";
import { PgDatabaseMigrator } from "./pg/PgDatabaseMigrator.ts";
import { PgDatabase } from "@4uruanna/sql-connector";
import * as zod from "zod";
import { PgHistoryRepository } from "./pg/PgHistoryRepository.ts";
import { PgQueryBuilder } from "@4uruanna/sql-query-builder";

if (Deno.permissions.requestSync({ name: 'env' }).state !== "granted") {
  throw new Error("Permission --allow-env required");
}
if (Deno.permissions.requestSync({ name: 'net' }).state !== "granted") {
  throw new Error("Permission --allow-net required");
}
if (Deno.permissions.requestSync({ name: 'read' }).state !== "granted") {
  throw new Error("Permission --allow-read required");
}


const zenv = zod.object({
  database: zod.string(),
  user: zod.string(),
  password: zod.string(),
  host: zod.string(),
  port: zod.int(),
  connectionLimit: zod.int(),
});

const dbConfig = zenv.parse({
  database: Deno.env.get("DATABASE_NAME"),
  user: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),

  host: Deno.env.has("DATABASE_HOST")
    ? Deno.env.get("DATABASE_HOST")
    : "localhost",

  port: Deno.env.has("DATABASE_PORT")
    ? Number(Deno.env.get("DATABASE_PORT"))
    : 5432,

  connectionLimit: Deno.env.get("DATABASE_POOL_SIZE")
    ? Number(Deno.env.get("DATABASE_POOL_SIZE"))
    : 1,
});

const database = new PgDatabase(dbConfig);

const repository = new PgHistoryRepository(database, new PgQueryBuilder());

const migrator = new PgDatabaseMigrator(database, repository, Deno.env.get("DATABASE_SCHEMA") ?? "");

if (Deno.args.length === 0) {
  helpCommand();
}

switch (Deno.args[0]) {
  case "migrate":
    await migrateCommand(migrator, Deno.args[1] ?? undefined);
    break;

  case "rollback":
    await rollbackCommand(migrator, Deno.args[1] ?? undefined);
    break;

  case "status":
    await statusCommand(migrator);
    break;

  default:
    helpCommand();
}

await database.dispose();
