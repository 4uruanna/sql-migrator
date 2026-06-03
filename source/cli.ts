import { helpCommand } from "./command/help.command.ts";
import { statusCommand } from "./command/status.command.ts";
import { migrateCommand } from "./command/migrate.command.ts";
import { rollbackCommand } from "./command/rollback.command.ts";
import { PgDatabaseMigrator } from "./pg/PgDatabaseMigrator.ts";
import { PgDatabase } from "@jackofblades/sql-connector";
import * as zod from "zod"
import {PgHistoryRepository} from "./pg/PgHistoryRepository.ts";
import { PgQueryBuilder } from "@jackofblades/sql-query-builder";

const zenv = zod.object({
  database: zod.string(),
  user: zod.string(),
  password: zod.string(),
  schema: zod.string(),
  host: zod.string(),
  port: zod.int(),
  max: zod.int()
})

const env = zenv.parse({
  database: Deno.env.get("DATABASE_NAME"),
  user: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),
  schema: Deno.env.get("DATABASE_SCHEMA"),

  host: Deno.env.has("DATABASE_HOST")
    ? Deno.env.get("DATABASE_HOST")
    : "localhost",

  port: Deno.env.has("DATABASE_PORT")
    ? Number(Deno.env.get("DATABASE_PORT"))
    : 5432,

  max: Deno.env.get("DATABASE_POOL_SIZE")
    ? Number(Deno.env.get("DATABASE_POOL_SIZE"))
    : 1,
});

const database = new PgDatabase(
  env.host,
  env.port,
  env.database,
  env.user,
  env.password,
  env.schema,
  env.max,
);

const repository = new PgHistoryRepository(
  database,
  new PgQueryBuilder()
);

const migrator = new PgDatabaseMigrator(database, repository);

if (Deno.args.length === 0) {
  helpCommand();
}

switch (Deno.args[0]) {
  case "migrate":
    await migrateCommand(migrator);
    break;

  case "rollback":
    await rollbackCommand(migrator);
    break;

  case "status":
    await statusCommand(migrator);
    break;

  default:
    helpCommand();
}

await database.dispose();