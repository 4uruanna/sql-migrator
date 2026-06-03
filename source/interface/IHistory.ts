import type { IModel } from "@jackofblades/sql-connector";

export interface IHistory extends IModel {
  id?: number;
  timestamp: Date;
  name: string;
  query: string;
  migrate_at?: Date;
}
