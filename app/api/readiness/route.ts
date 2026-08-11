import { getStorageReadiness } from "@/lib/storage/config";
import { checkPostgresConnection } from "@/lib/storage/postgres";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const storage = getStorageReadiness();
  const ai = getAiPlatformStatus();
  const authConfigured = Boolean(process.env.VELVET_OWNER_USER_ID?.trim());
  const aiConfigured = ai.configured && ai.clientConfigured;
  const database = storage.persistent ? await checkPostgresConnection() : null;
  const databaseReady = Boolean(database?.connected);

  // AI is not a launch blocker because Velvet has deterministic local fallback.
  const productionReady = authConfigured && storage.persistent && databaseReady;

  return Response.json({
    appName: "velvet",
    domain: "mvp-readiness",
    status: productionReady ? "success" : "warning",
    productionReady,
    checks: {
      auth: authConfigured ? "success" : "warning",
      storageConfig: storage.persistent ? "success" : "warning",
      databaseConnection: databaseReady ? "success" : "warning",
      persistenceAdapters: "success",
      ai: aiConfigured ? "success" : "warning",
    },
    issues: [
      ...(!authConfigured ? ["AUTH_NOT_CONFIGURED"] : []),
      ...(!storage.persistent ? ["PERSISTENCE_NOT_CONFIGURED"] : []),
      ...(storage.persistent && !databaseReady ? ["DATABASE_CONNECTION_FAILED"] : []),
      ...(!aiConfigured ? ["AI_PLATFORM_OPTIONAL_NOT_CONFIGURED"] : []),
    ],
  });
}
