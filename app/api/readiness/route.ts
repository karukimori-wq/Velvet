import { getStorageReadiness } from "@/lib/storage/config";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";

export async function GET() {
  const storage = getStorageReadiness();
  const ai = getAiPlatformStatus();
  const authConfigured = Boolean(process.env.VELVET_OWNER_USER_ID?.trim());
  const aiConfigured = ai.configured && ai.clientConfigured;

  // AI is not a launch blocker because Velvet has deterministic local fallback.
  const productionReady = storage.persistent && authConfigured;

  return Response.json({
    appName: "velvet",
    domain: "mvp-readiness",
    status: productionReady ? "success" : "warning",
    productionReady,
    checks: {
      auth: authConfigured ? "success" : "warning",
      storage: storage.persistent ? "success" : "warning",
      ai: aiConfigured ? "success" : "warning",
    },
    issues: [
      ...(!authConfigured ? ["AUTH_NOT_CONFIGURED"] : []),
      ...(!storage.persistent ? ["PERSISTENCE_NOT_CONFIGURED"] : []),
      ...(!aiConfigured ? ["AI_PLATFORM_OPTIONAL_NOT_CONFIGURED"] : []),
    ],
  });
}
