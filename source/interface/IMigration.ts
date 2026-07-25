import type { IHistory } from "./IHistory.ts";

export interface IMigration {
  filename: string;
  migration: { up(): string, down(): string };
  history: IHistory;
}
