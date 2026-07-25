import type { Client } from "@4uruanna/sql-connector";
import type { IHistory } from "../interface/IHistory.ts";

export abstract class HistoryRepository {
  abstract findAll(): Promise<IHistory[]>;

  abstract findLast(): Promise<IHistory | null>;

  abstract insert(history: IHistory, client: Client): Promise<void>;

  abstract deleteByTimestamp(timestamp: Date): Promise<void>;

  abstract initialize(schema: string): Promise<void>;
}
