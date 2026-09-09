import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getStorageMode } from "@/lib/storage/config";

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

/**
 * Resolve the actual Cloudflare DB binding when it exists.
 *
 * Do not gate this lookup on process.env.VELVET_STORAGE_MODE. OpenNext can expose
 * Worker bindings through getCloudflareContext even when process.env resolution
 * differs between server bundles. Repository code can therefore prefer the
 * concrete D1 binding and avoid accidentally falling back to in-memory storage.
 */
export async function getD1Database(): Promise<D1DatabaseLike | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    return (context.env as unknown as { DB?: D1DatabaseLike }).DB ?? null;
  } catch {
    return null;
  }
}

export async function getD1Readiness() {
  const configuredMode = getStorageMode();
  const db = await getD1Database();
  if (!db) {
    return {
      driver: configuredMode,
      d1Configured: false,
      d1Reachable: false,
      databaseBackedPersistenceReady: configuredMode === "postgres",
    };
  }
  try {
    const row = await db.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    const ready = row?.ok === 1;
    return { driver: "d1" as const, d1Configured: true, d1Reachable: ready, databaseBackedPersistenceReady: ready };
  } catch {
    return { driver: "d1" as const, d1Configured: true, d1Reachable: false, databaseBackedPersistenceReady: false };
  }
}

export function makeD1Id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
