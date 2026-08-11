import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL_MISSING");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 1,
  ssl: process.env.VELVET_DB_SSL === "disable" ? false : { rejectUnauthorized: false },
});

try {
  const dbDir = path.join(process.cwd(), "db");
  const files = (await fs.readdir(dbDir)).filter((file) => /^\d+_.*\.sql$/.test(file)).sort();

  await pool.query(`
    create table if not exists velvet_schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  for (const filename of files) {
    const existing = await pool.query("select 1 from velvet_schema_migrations where filename = $1", [filename]);
    if (existing.rowCount) {
      console.log(`skip ${filename}`);
      continue;
    }

    const sql = await fs.readFile(path.join(dbDir, filename), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into velvet_schema_migrations (filename) values ($1)", [filename]);
      await client.query("commit");
      console.log(`applied ${filename}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  console.log("Velvet migrations complete.");
} finally {
  await pool.end();
}
