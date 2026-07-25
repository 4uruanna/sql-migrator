/**
 * Main CLI entry point for the SQL migrator.
 * This module handles command-line argument parsing, environment configuration,
 * and routes commands to the appropriate handlers.
 */
import { helpCommand } from "./command/help.command.ts";
import { statusCommand } from "./command/status.command.ts";
import { migrateCommand } from "./command/migrate.command.ts";
import { rollbackCommand } from "./command/rollback.command.ts";
import { PgDatabaseMigrator } from "./pg/PgDatabaseMigrator.ts";
import { PgDatabase } from "@4uruanna/sql-connector";
import * as zod from "zod";
import { PgHistoryRepository } from "./pg/PgHistoryRepository.ts";
import { PgQueryBuilder } from "@4uruanna/sql-query-builder";

// Validate required permissions
if (Deno.permissions.requestSync({ name: 'env' }).state !== "granted") {
  throw new Error("Permission --allow-env required");
}
if (Deno.permissions.requestSync({ name: 'net' }).state !== "granted") {
  throw new Error("Permission --allow-net required");
}
if (Deno.permissions.requestSync({ name: 'read' }).state !== "granted") {
  throw new Error("Permission --allow-read required");
}

/**
 * Environment variable schema for database configuration.
 * Validates and parses database connection parameters from environment variables.
 */
const zenv = zod.object({
  database: zod.string(),
  user: zod.string(),
  password: zod.string(),
  host: zod.string(),
  port: zod.int(),
  connectionLimit: zod.int(),
});

/**
 * Database configuration parsed from environment variables.
 * Falls back to default values for optional parameters:
 * - host: "localhost"
 * - port: 5432
 * - connectionLimit: 1
 */
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

// Initialize database and repository
const database = new PgDatabase(dbConfig);
const repository = new PgHistoryRepository(database, new PgQueryBuilder());
const migrator = new PgDatabaseMigrator(database, repository, Deno.env.get("DATABASE_SCHEMA") ?? "");

// Handle command-line arguments
if (Deno.args.length === 0) {
  helpCommand();
}

/**
 * Routes the command to the appropriate handler based on the first argument.
 * Supported commands: migrate, rollback, status, help
 */
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

// Clean up database connection
await database.dispose();
