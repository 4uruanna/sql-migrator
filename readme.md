# @4uruanna/sql-migrator

[![JSR](https://jsr.io/badges/@4uruanna/di?style=flat-square)](https://jsr.io/@4uruanna/sql-migrator)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Deno](https://img.shields.io/badge/Deno->=2.0-000000?style=flat-square&logo=deno)](https://deno.land)

Lightweight CLI tool for managing SQL migrations in PostgreSQL databases. It provides a simple and efficient way to apply, rollback, and track database schema changes.


## Using JSR (Recommended)

```bash
# Run directly from JSR
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator [command]
```

## Configuration

Create a `.env` file in your project root with the following environment variables:

```env
# Required
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password

# Optional (defaults shown)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_SCHEMA=public
DATABASE_POOL_SIZE=1
```

Alternatively, you can pass environment variables directly:

```bash
export DATABASE_NAME=my_db
export DATABASE_USERNAME=user
export DATABASE_PASSWORD=pass
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator migrate
```

## Project Structure

```
your-project/
├── .env                    # Database configuration
├── sql/                    # Migration files directory
│   ├── 202401010000_create_users.ts
│   ├── 202401020000_add_indexes.ts
│   └── 202401030000_update_schema.ts
└── ...
```

## Creating Migrations

Migration files must be placed in the `sql/` directory and follow the naming convention:

```
YYYYMMDDHHMM_description.ts
```

Where:
- `YYYY` = Year (4 digits)
- `MM` = Month (2 digits, 01-12)
- `DD` = Day (2 digits, 01-31)
- `HH` = Hour (2 digits, 00-23)
- `MM` = Minute (2 digits, 00-59)
- `description` = Descriptive name (alphanumeric and underscores only)

### Migration File Template

```typescript
// sql/202401010000_create_users.ts

export default {
  /**
   * SQL to apply the migration (CREATE, ALTER, etc.)
   */
  up(): string {
    return `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
  },

  /**
   * SQL to rollback the migration (DROP, etc.)
   */
  down(): string {
    return `DROP TABLE users;`;
  }
};
```

## Commands

### `help`

Displays the help message with all available commands and options.

```bash
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator help
```

### `status`

Lists all migrations and their execution status. Shows two tables:
- **Database history**: Migrations that have been executed
- **Pending migrations**: Migrations that have not been executed yet

```bash
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator status
```

Example output:
```
Database history (executed migrations)
┌─────────────────┬─────────────────────┬─────────────────┐
│    timestamp    │         name        │    migrate_at    │
├─────────────────┼─────────────────────┼─────────────────┤
│ 2024-01-01T00:00│  create_users        │ 2024-01-01T10:00│
└─────────────────┴─────────────────────┴─────────────────┘

Pending migrations
┌─────────────────┬─────────────────────┐
│    timestamp    │         name        │
├─────────────────┼─────────────────────┤
│ 2024-01-02T00:00│  add_indexes         │
└─────────────────┴─────────────────────┘
```

### `migrate`

Applies pending migrations in chronological order.

```bash
# Apply all pending migrations
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator migrate

# Apply migrations up to a specific timestamp
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator migrate --to=202401020000
```

The `--to` option accepts a timestamp prefix (YYYYMMDDHHMM) and will only apply migrations with timestamps less than or equal to the specified value.

### `rollback`

Reverts executed migrations in reverse chronological order (most recent first).

```bash
# Rollback all migrations
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator rollback

# Rollback migrations from a specific timestamp onwards
deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator rollback --to=202401020000
```

The `--to` option accepts a timestamp prefix (YYYYMMDDHHMM) and will only rollback migrations with timestamps greater than or equal to the specified value.

## Usage with Deno Tasks

Add tasks to your `deno.json` for easier execution:

```json
{
  "tasks": {
    "migrate": "deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator migrate",
    "rollback": "deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator rollback",
    "status": "deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator status",
    "help": "deno run --allow-env --allow-net --allow-read jsr:@4uruanna/sql-migrator help"
  }
}
```

Then run:
```bash
# Apply migrations
deno task migrate

# Check status
deno task status

# Rollback
deno task rollback
```

## Database Schema

The migrator creates a `sql_history` table in your database schema to track executed migrations:

```sql
CREATE TABLE IF NOT EXISTS sql_history (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP UNIQUE NOT NULL,
  query TEXT NOT NULL,
  migrate_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## License

This project is licensed under the Apache License 2.0 - see the [license](https://github.com/4uruanna/sql-migrator/blob/main/license) file for details.

## Acknowledgments

- Uses [@4uruanna/sql-connector](https://jsr.io/@4uruanna/sql-connector) for database connections
- Uses [@4uruanna/sql-query-builder](https://jsr.io/@4uruanna/sql-query-builder) for SQL query construction
