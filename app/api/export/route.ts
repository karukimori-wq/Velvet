import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { exportVelvetData } from "@/lib/import-export";

export async function GET() {
  const ownerUserId = getCurrentOwnerUserId();
  return Response.json(await exportVelvetData(ownerUserId), {
    headers: { "Content-Disposition": "attachment; filename=velvet-export.json" },
  });
}
