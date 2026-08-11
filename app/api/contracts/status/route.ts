export async function GET() {
  return Response.json({
    appName: "velvet",
    status: "success",
    contractVersion: "0.1.0"
  });
}
