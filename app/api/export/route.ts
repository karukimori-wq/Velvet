import { getRequestIdentity } from "@/lib/auth/request-identity";
import { exportVelvetData } from "@/lib/import-export";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  return Response.json(await exportVelvetData(ownerUserId), {
    headers: { "Content-Disposition": "attachment; filename=velvet-export.json" },
  });
}
