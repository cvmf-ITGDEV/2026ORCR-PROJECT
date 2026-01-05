import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

function getEntities() {
  if (typeof window !== "undefined" || process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }

  return [
    require("@/entities/user.entity").User,
    require("@/entities/application.entity").Application,
    require("@/entities/loan.entity").Loan,
    require("@/entities/official-receipt.entity").OfficialReceipt,
    require("@/entities/collection-receipt.entity").CollectionReceipt,
    require("@/entities/audit-log.entity").AuditLog,
    require("@/entities/ref-region.entity").RefRegion,
    require("@/entities/ref-province.entity").RefProvince,
    require("@/entities/ref-city.entity").RefCity,
  ];
}

function createDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL || "postgres://localhost:5432/stub";

  return new DataSource({
    type: "postgres" as const,
    url: databaseUrl,
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: getEntities(),
    migrations: [],
    subscribers: [],
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      max: 10,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 10000,
    },
  });
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
