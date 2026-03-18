import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { PrismaClient } = prismaPkg;

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
dotenv.config({
  path: resolve(currentDirPath, "../../../.env"),
  override: process.env.NODE_ENV !== "production",
});

function getRequiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Missing required environment variable DATABASE_URL. Configure DATABASE_URL in Azure App Service > Environment variables."
    );
  }

  return databaseUrl;
}

const connectionString = getRequiredDatabaseUrl();
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const pool = new pg.Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});