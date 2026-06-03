import type { IHistory } from "../interface/IHistory.ts";

export abstract class HistoryRepository {
  abstract findAll(): Promise<IHistory[]>;

  abstract findLast(): Promise<IHistory | null>;

  abstract insert(history: IHistory): Promise<void>;

  abstract deleteByTimestamp(timestamp: Date): Promise<void>;

  abstract initialize(): Promise<void>;
}
