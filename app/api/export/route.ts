import { getRequestIdentity } from "@/lib/auth/request-identity";
import { exportVelvetData } from "@/lib/import-export";

export async function GET() {
  const { workspaceId, userId } = await getRequestIdentity();
  return Response.json(await exportVelvetData(workspaceId, userId), {
    headers: { "Content-Disposition": "attachment; filename=velvet-professional-memory-export.json" },
  });
}
