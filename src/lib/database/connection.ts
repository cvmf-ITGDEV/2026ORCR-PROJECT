import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});

let isInitialized = false;

export async function getDataSource(): Promise<DataSource> {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
  }
  return AppDataSource;
}

export async function closeDataSource(): Promise<void> {
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
  }
}
