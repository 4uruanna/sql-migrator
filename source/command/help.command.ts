/**
 * Displays help information for the SQL migrator CLI.
 * This module provides the help command that shows available commands
 * and their usage instructions.
 */

/**
 * Displays the help message with available commands and options.
 * The help message includes:
 * - Package name and description
 * - Usage instructions
 * - List of available commands (help, status, migrate, rollback)
 * - Options for each command
 */
export const helpCommand = function (): void {
  console.log(
    `@4uruanna/sql-migrator is a lightweight CLI that helps you to migrate or rollback your PostgreSQL database.

Usage:

  deno run --allow-env --env-file --allow-net --allow-read jsr:@4uruanna/sql-migrator [COMMAND]

Commands:

  help          Show this help message with available commands and options

  status        List all migrations and their execution status
                Shows both database history and pending migrations

  migrate       Run pending migrations
                Options: 
                    --to=[PREFIX] Will stop at the given script prefix (timestamp)
                    Example: deno run ... migrate --to=202401010000

  rollback      Revert executed migrations
                Options:
                    --to=[PREFIX] Will stop at the given script prefix (timestamp)
                    Example: deno run ... rollback --to=202401010000
`,
  );
};
