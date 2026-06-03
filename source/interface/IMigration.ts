import { IHistory } from "./IHistory.ts";

export abstract class Migration {
  abstract up(): string;
  abstract down(): string;
}

export interface IMigration {
  filename: string;
  migration: Migration;
  history: IHistory;
}
