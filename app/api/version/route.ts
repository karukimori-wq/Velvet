export async function GET() {
  return Response.json({ appName: "velvet", version: "0.1.0", status: "success" });
}
