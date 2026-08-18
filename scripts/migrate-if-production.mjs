import {spawnSync} from "node:child_process";
import process from "node:process";

const production = process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && process.env.VERCEL === "1");
const configured = Boolean(process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim());
if (!production) {
  console.log("Velvet migrations: skipped outside Vercel production.");
  process.exit(0);
}
if (!configured) {
  console.log("Velvet migrations: database not configured; skipping.");
  process.exit(0);
}
const result = spawnSync(process.execPath,["scripts/migrate.mjs"],{stdio:"inherit",env:process.env});
if (result.status !== 0) process.exit(result.status ?? 1);
