export async function GET() {
  return Response.json({ appName: "velvet", status: "success", healthy: true });
}
