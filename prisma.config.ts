import "dotenv/config";
import { defineConfig } from "prisma/config";

function resolveDatabaseUrl() {
  return process.env["DATABASE_URL"] ?? process.env["POSTGRES_PRISMA_URL"] ?? process.env["POSTGRES_URL"];
}

function resolveDirectUrl() {
  return (
    process.env["DIRECT_URL"] ??
    process.env["POSTGRES_URL_NON_POOLING"] ??
    resolveDatabaseUrl()
  );
}

const databaseUrl = resolveDatabaseUrl();
const directUrl = resolveDirectUrl();

if (!databaseUrl || !directUrl) {
  throw new Error(
    "Missing Postgres environment variables. Set DATABASE_URL / DIRECT_URL or POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
    directUrl,
  },
});
