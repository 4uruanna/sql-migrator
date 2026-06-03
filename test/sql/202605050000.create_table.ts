import { Migration } from "../../source/interface/IMigration.ts";

class CreateTableExample extends Migration {
  public up(): string {
    return `
    CREATE TABLE test (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(255) NOT NULL
    );
    `;
  }

  public down(): string {
    return `DROP TABLE test;`;
  }
}

export default new CreateTableExample();
