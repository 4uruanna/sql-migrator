export const helpCommand = function (): void {
  console.log(
    `@jackofblades/sql-migrator is a lightweight CLI that help you to migrate or rollback your database.

Usage:

  deno run --allow-env --env-file --allow-net --allow-read jsr:@jackofblades/sql-migrator [COMMAND]

Commands:

  help          Available commands and options

  status        List all migrations

  migrate       Run some/all migrations
                Options: 
                    --to=[PREFIX] Will stop at the given script prefix

  rollback      Revert some/all migrations
                Options:
                    --to=[PREFIX] Will stop at the given script prefix
`,
  );
};
