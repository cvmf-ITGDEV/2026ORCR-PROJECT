import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Please ensure it's set in your .env file."
  );
}

const dataSourceConfig = {
  type: "postgres" as const,
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 10,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
};

function createDataSource(): DataSource {
  return new DataSource(dataSourceConfig);
}

export async function getDataSource(): Promise<DataSource> {
  if (!globalThis.__dataSource) {
    if (!globalThis.__dataSourceInitPromise) {
      globalThis.__dataSourceInitPromise = (async () => {
        try {
          const dataSource = createDataSource();
          await dataSource.initialize();
          globalThis.__dataSource = dataSource;

          if (process.env.NODE_ENV === "development") {
            console.log("✓ Database connection established successfully");
          }

          return dataSource;
        } catch (error) {
          globalThis.__dataSourceInitPromise = undefined;
          throw error;
        }
      })();
    }

    return globalThis.__dataSourceInitPromise;
  }

  if (!globalThis.__dataSource.isInitialized) {
    try {
      await globalThis.__dataSource.initialize();
    } catch (error) {
      console.error("Failed to reinitialize DataSource:", error);
      throw error;
    }
  }

  return globalThis.__dataSource;
}

export async function closeDataSource(): Promise<void> {
  if (globalThis.__dataSource?.isInitialized) {
    await globalThis.__dataSource.destroy();
    globalThis.__dataSource = undefined;
    globalThis.__dataSourceInitPromise = undefined;

    if (process.env.NODE_ENV === "development") {
      console.log("✓ Database connection closed successfully");
    }
  }
}

export const AppDataSource = createDataSource();
