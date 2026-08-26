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

export async function getD1Database(): Promise<D1DatabaseLike | null> {
  if (getStorageMode() !== "d1") return null;
  try {
    const context = await getCloudflareContext({ async: true });
    return (context.env as unknown as { DB?: D1DatabaseLike }).DB ?? null;
  } catch {
    return null;
  }
}

export async function getD1Readiness() {
  if (getStorageMode() !== "d1") {
    return { driver: getStorageMode(), d1Configured: false, d1Reachable: false, databaseBackedPersistenceReady: getStorageMode() === "postgres" };
  }
  const db = await getD1Database();
  if (!db) return { driver: "d1" as const, d1Configured: false, d1Reachable: false, databaseBackedPersistenceReady: false };
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
