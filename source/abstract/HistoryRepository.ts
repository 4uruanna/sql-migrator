/**
 * Abstract base class for migration history repository operations.
 * This class defines the contract for storing, retrieving, and managing
 * migration history records in the database.
 */
import type { Client } from "@4uruanna/sql-connector";
import type { IHistory } from "../interface/IHistory.ts";

export abstract class HistoryRepository {
  /**
   * Retrieves all migration history records from the database.
   * @returns A promise that resolves to an array of IHistory objects, ordered by timestamp.
   */
  abstract findAll(): Promise<IHistory[]>;

  /**
   * Retrieves the most recent migration history record.
   * @returns A promise that resolves to the last IHistory object, or null if no records exist.
   */
  abstract findLast(): Promise<IHistory | null>;

  /**
   * Inserts a new migration history record into the database.
   * @param history - The history record to insert.
   * @param client - The database client to use for the insertion.
   * @returns A promise that resolves when the insertion is complete.
   */
  abstract insert(history: IHistory, client: Client): Promise<void>;

  /**
   * Deletes a migration history record by its timestamp.
   * @param timestamp - The timestamp of the record to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  abstract deleteByTimestamp(timestamp: Date): Promise<void>;

  /**
   * Initializes the migration history table in the database.
   * Creates the table if it does not exist.
   * @param schema - The database schema where the history table should be created.
   * @returns A promise that resolves when the initialization is complete.
   */
  abstract initialize(schema: string): Promise<void>;
}
