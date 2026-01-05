import type { DataSource } from "typeorm";

declare global {
  var __dataSource: DataSource | undefined;
  var __dataSourceInitPromise: Promise<DataSource> | undefined;
}

export {};
