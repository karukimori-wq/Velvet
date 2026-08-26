export type StorageMode = "memory" | "postgres" | "d1";

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || undefined;
}

export function getStorageMode(): StorageMode {
  const configured = process.env.VELVET_STORAGE_MODE?.trim().toLowerCase();
  if (configured === "d1") return "d1";
  if (configured === "postgres") return "postgres";
  if (configured === "memory") return "memory";
  if (getDatabaseUrl()) return "postgres";
  return "memory";
}

export function assertProductionStorageReady() {
  const mode = getStorageMode();
  if (process.env.NODE_ENV === "production" && mode !== "postgres" && mode !== "d1") {
    throw new Error("PERSISTENCE_NOT_CONFIGURED: production requires persistent storage.");
  }
  if (mode === "postgres" && !getDatabaseUrl()) {
    throw new Error("DATABASE_URL_MISSING: postgres storage requires DATABASE_URL or POSTGRES_URL.");
  }
  return mode;
}

export function getStorageReadiness() {
  const mode = getStorageMode();
  const databaseUrlConfigured = Boolean(getDatabaseUrl());
  const persistent = mode === "d1" || (mode === "postgres" && databaseUrlConfigured);
  return {
    mode,
    databaseUrlConfigured,
    persistent,
    status: persistent ? "success" as const : "warning" as const,
    errorCode: persistent ? null : "PERSISTENCE_NOT_CONFIGURED",
  };
}
