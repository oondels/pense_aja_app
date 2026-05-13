import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "./dotenv";
import { entities } from "../models";
import { migrations } from "../migrations";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dotenv.IP,
  port: Number(dotenv.PORT),
  username: dotenv.USERS,
  password: dotenv.PASS,
  database: dotenv.DBASE,
  entities,
  migrations,
  synchronize: false,
  logging: dotenv.DEV_ENV === "development",
});

let initializationPromise: Promise<DataSource> | null = null;

export const initializeDatabase = async (): Promise<DataSource> => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initializationPromise) {
    initializationPromise = AppDataSource.initialize().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
};
