import { execFileSync } from "node:child_process";

import "dotenv/config";

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;
}

function resolveDirectUrl() {
  return process.env.DIRECT_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? resolveDatabaseUrl();
}

function assertPostgresUrl(name, value) {
  if (!value) {
    throw new Error(`缺少 ${name}。请先配置 Postgres 连接。`);
  }

  if (!value.startsWith("postgres://") && !value.startsWith("postgresql://")) {
    throw new Error(`${name} 必须是 Postgres 连接字符串。`);
  }
}

const databaseUrl = resolveDatabaseUrl();
const directUrl = resolveDirectUrl();

assertPostgresUrl("DATABASE_URL / POSTGRES_PRISMA_URL", databaseUrl);
assertPostgresUrl("DIRECT_URL / POSTGRES_URL_NON_POOLING", directUrl);

const npmExecPath = process.env.npm_execpath;

if (!npmExecPath) {
  throw new Error("当前脚本需要通过 npm run 执行，以便调用 Prisma CLI。");
}

const shouldReset = process.argv.includes("--reset");
const prismaArgs = shouldReset
  ? ["exec", "prisma", "--", "migrate", "reset", "--force", "--skip-generate", "--skip-seed"]
  : ["exec", "prisma", "--", "migrate", "deploy"];

execFileSync(process.execPath, [npmExecPath, ...prismaArgs], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: directUrl,
  },
});

console.log(
  shouldReset
    ? "Database reset complete with Prisma migrations."
    : "Database migrated with Prisma deploy.",
);
