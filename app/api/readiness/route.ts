import { getAuthReadiness } from "@/lib/auth-readiness";
import { getStorageReadiness } from "@/lib/storage/config";
import { checkPostgresConnection } from "@/lib/storage/postgres";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const auth = getAuthReadiness();
  const storage = getStorageReadiness();
  const ai = getAiPlatformStatus();
  const aiConfigured = ai.configured && ai.clientConfigured;
  const database = storage.persistent ? await checkPostgresConnection() : null;
  const databaseReady = Boolean(database?.connected);

  // AI is not a launch blocker because Velvet has deterministic local fallback.
  const productionReady = auth.productionReady && storage.persistent && databaseReady;

  return Response.json({
    appName: "velvet",
    domain: "mvp-readiness",
    status: productionReady ? "success" : "warning",
    productionReady,
    checks: {
      auth: auth.productionReady ? "success" : "warning",
      storageConfig: storage.persistent ? "success" : "warning",
      databaseConnection: databaseReady ? "success" : "warning",
      persistenceAdapters: "success",
      ai: aiConfigured ? "success" : "warning",
    },
    auth: {
      mode: auth.mode,
      sessionAdapterImplemented: auth.sessionAdapterImplemented,
      fixedOwnerConfigured: auth.fixedOwnerConfigured,
    },
    issues: [
      ...(!auth.productionReady ? [auth.errorCode ?? "AUTH_NOT_CONFIGURED"] : []),
      ...(!storage.persistent ? ["PERSISTENCE_NOT_CONFIGURED"] : []),
      ...(storage.persistent && !databaseReady ? ["DATABASE_CONNECTION_FAILED"] : []),
      ...(!aiConfigured ? ["AI_PLATFORM_OPTIONAL_NOT_CONFIGURED"] : []),
    ],
  });
}
