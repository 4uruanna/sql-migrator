import { Migration } from "../../source/interface/IMigration.ts";

class CreateTableExample extends Migration {
  public up(): string {
    return `
    CREATE TABLE test2 (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(255) NOT NULL,
      tid   INTEGER NOT NULL REFERENCES test (id)
    );
    `;
  }

  public down(): string {
    return `DROP TABLE test2;`;
  }
}

export default new CreateTableExample();
