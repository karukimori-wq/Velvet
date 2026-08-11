import { getStorageReadiness } from "@/lib/storage/config";

export async function GET() {
  const storage = getStorageReadiness();
  const authConfigured = Boolean(process.env.VELVET_OWNER_USER_ID?.trim());
  const productionReady = storage.persistent && authConfigured;

  return Response.json({
    appName: "velvet",
    domain: "mvp-readiness",
    status: productionReady ? "success" : "warning",
    productionReady,
    checks: {
      auth: authConfigured ? "success" : "warning",
      storage: storage.persistent ? "success" : "warning",
    },
    issues: [
      ...(!authConfigured ? ["AUTH_NOT_CONFIGURED"] : []),
      ...(!storage.persistent ? ["PERSISTENCE_NOT_CONFIGURED"] : []),
    ],
  });
}
