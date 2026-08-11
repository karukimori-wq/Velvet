import { exportVelvetData } from "@/lib/import-export";

export async function GET() {
  return Response.json(exportVelvetData(), {
    headers: { "Content-Disposition": "attachment; filename=velvet-export.json" },
  });
}
