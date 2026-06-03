import * as path from "@std/path";

const CWD = Deno.cwd();

const CONSTANTS = {
  CWD,
  DIRECTORY: {
    SQL: path.resolve(CWD, "sql"),
  },
  TABLE: "sql_history",
};

export default CONSTANTS;
