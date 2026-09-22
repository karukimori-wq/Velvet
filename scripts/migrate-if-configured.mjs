import { spawnSync } from "node:child_process";
import process from "node:process";

const storageMode = process.env.VELVET_STORAGE_MODE?.trim().toLowerCase();
const shouldRun = process.env.VELVET_RUN_POSTGRES_MIGRATIONS === "1";
const configured = Boolean(process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim());

if (!shouldRun) {
  console.log("Velvet migrations: skipped unless VELVET_RUN_POSTGRES_MIGRATIONS=1.");
  process.exit(0);
}

if (storageMode !== "postgres") {
  console.log("Velvet migrations: skipped because storage mode is not postgres.");
  process.exit(0);
}

if (!configured) {
  console.log("Velvet migrations: database not configured; skipping.");
  process.exit(0);
}

const result = spawnSync(process.execPath, ["scripts/migrate.mjs"], { stdio: "inherit", env: process.env });
if (result.status !== 0) process.exit(result.status ?? 1);
