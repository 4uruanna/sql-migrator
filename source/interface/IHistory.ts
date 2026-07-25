export interface IHistory {
  id?: number;
  timestamp: Date;
  name: string;
  query: string;
  migrate_at?: Date;
}
