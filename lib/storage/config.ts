export type StorageMode = "memory" | "postgres";

export function getStorageMode(): StorageMode {
  const configured = process.env.VELVET_STORAGE_MODE?.trim().toLowerCase();
  if (configured === "postgres") return "postgres";
  if (configured === "memory") return "memory";

  if (process.env.DATABASE_URL) return "postgres";
  return "memory";
}

export function assertProductionStorageReady() {
  const mode = getStorageMode();
  if (process.env.NODE_ENV === "production" && mode !== "postgres") {
    throw new Error("PERSISTENCE_NOT_CONFIGURED: production requires persistent storage.");
  }
  if (mode === "postgres" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL_MISSING: postgres storage requires DATABASE_URL.");
  }
  return mode;
}

export function getStorageReadiness() {
  const mode = getStorageMode();
  const persistent = mode === "postgres" && Boolean(process.env.DATABASE_URL);
  return {
    mode,
    persistent,
    status: persistent ? "success" as const : "warning" as const,
    errorCode: persistent ? null : "PERSISTENCE_NOT_CONFIGURED",
  };
}
