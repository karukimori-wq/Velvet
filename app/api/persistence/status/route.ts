import { NextResponse } from "next/server";
import { getStorageReadiness } from "@/lib/storage/config";
import { getD1Readiness } from "@/lib/storage/d1";
import { checkPostgresConnection, dbQuery } from "@/lib/storage/postgres";

export async function GET() {
  const storage = getStorageReadiness();

  if (storage.mode === "d1") {
    const d1 = await getD1Readiness();
    return NextResponse.json({
      appName: "velvet",
      status: d1.databaseBackedPersistenceReady ? "success" : "error",
      storageMode: "d1",
      repositoryDriver: "d1",
      driver: "d1",
      persistent: true,
      databaseConfigured: d1.d1Configured,
      d1Configured: d1.d1Configured,
      d1Reachable: d1.d1Reachable,
      databaseBackedPersistenceReady: d1.databaseBackedPersistenceReady,
      errorCode: d1.databaseBackedPersistenceReady ? null : "D1_NOT_READY",
      timestamp: new Date().toISOString()
    }, { status: d1.databaseBackedPersistenceReady ? 200 : 503 });
  }

  if (!storage.persistent) {
    return NextResponse.json({
      appName: "velvet",
      status: "warning",
      storageMode: storage.mode,
      repositoryDriver: storage.mode,
      persistent: false,
      databaseConfigured: storage.databaseUrlConfigured,
      postgresReachable: false,
      migrationsReady: false,
      nextActionMigrationApplied: false,
      databaseBackedPersistenceReady: false,
      errorCode: storage.errorCode,
      message: "Velvet data is using temporary in-memory storage. Configure DATABASE_URL or POSTGRES_URL for reliable production flows."
    });
  }

  const connection = await checkPostgresConnection();
  if (!connection.connected) {
    return NextResponse.json({
      appName: "velvet",
      status: "error",
      storageMode: storage.mode,
      repositoryDriver: storage.mode,
      persistent: true,
      databaseConfigured: true,
      postgresReachable: false,
      migrationsReady: false,
      nextActionMigrationApplied: false,
      databaseBackedPersistenceReady: false,
      errorCode: connection.errorCode,
      message: connection.message
    }, { status: 503 });
  }

  let applied: string[] = [];
  try {
    const result = await dbQuery<{ filename: string }>("select filename from velvet_schema_migrations order by filename");
    applied = result.rows.map((row) => row.filename);
  } catch {}

  const required = ["009_customer_scoped_professional_records.sql", "009_professional_timeline.sql", "010_capture_dictionary.sql", "011_professional_next_actions.sql"];
  const missing = required.filter((file) => !applied.includes(file));
  return NextResponse.json({
    appName: "velvet",
    status: missing.length ? "warning" : "success",
    storageMode: storage.mode,
    repositoryDriver: storage.mode,
    persistent: true,
    databaseConfigured: true,
    postgresReachable: true,
    migrationsReady: missing.length === 0,
    nextActionMigrationApplied: applied.includes("011_professional_next_actions.sql"),
    missingMigrations: missing,
    databaseBackedPersistenceReady: missing.length === 0,
    databaseTime: connection.databaseTime,
    durationMs: connection.durationMs,
    errorCode: missing.length ? "MIGRATIONS_INCOMPLETE" : null
  });
}
