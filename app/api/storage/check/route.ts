import { getStorageMode } from "@/lib/storage/config";
import { checkPostgresConnection } from "@/lib/storage/postgres";

export async function GET() {
  const mode = getStorageMode();
  if (mode !== "postgres") {
    return Response.json({
      appName: "velvet",
      domain: "storage-check",
      status: "warning",
      mode,
      connected: false,
      error: {
        code: "PERSISTENCE_NOT_CONFIGURED",
        message: "PostgreSQL storage is not enabled.",
        retryable: false,
      },
    });
  }

  const checked = await checkPostgresConnection();
  return Response.json({
    appName: "velvet",
    domain: "storage-check",
    mode,
    ...checked,
    error: checked.connected ? null : {
      code: checked.errorCode,
      message: checked.message,
      retryable: true,
    },
  }, { status: checked.connected ? 200 : 503 });
}
