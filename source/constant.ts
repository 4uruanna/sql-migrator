import * as path from "@std/path";

const CWD = Deno.cwd();

const CONSTANTS = {
  MIGRATION_FILENAME_REGEX: /^\d{12}\.[a-zA-Z0-9_]+\.ts$/,
  CWD,
  DIRECTORY: {
    SQL: path.resolve(CWD, "sql"),
  },
  TABLE: "sql_history",
};

export default CONSTANTS;
