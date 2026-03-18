import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { PrismaClient } = prismaPkg;

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
dotenv.config({ path: resolve(currentDirPath, "../../../.env") });

function getRequiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Missing required environment variable DATABASE_URL. Configure DATABASE_URL in Azure App Service > Environment variables."
    );
  }

  return databaseUrl;
}

const adapter = new PrismaPg({
  connectionString: getRequiredDatabaseUrl(),
});

export const prisma = new PrismaClient({
  adapter,
});