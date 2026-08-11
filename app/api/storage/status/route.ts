import { getStorageStatus } from "@/lib/storage-status";

export async function GET() {
  const storage = getStorageStatus();
  return Response.json({
    appName: "velvet",
    domain: "storage",
    status: storage.productionReady ? "success" : "warning",
    ...storage,
    error: storage.productionReady ? null : {
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Velvet is currently using volatile in-memory storage.",
      retryable: false,
    },
  });
}
