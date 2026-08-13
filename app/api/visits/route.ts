import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { startProfessionalVisit } from "@/lib/professional-visit-repository";

function observability(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID();
  const correlationId = request.headers.get("x-correlation-id") ?? traceId;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  return { traceId, correlationId, requestId };
}

export async function GET() {
  return NextResponse.json({
    status: "warning",
    message: "Use customer-scoped Professional Visit references. Velvet does not expose Sales/Payment visit ledgers.",
  }, { status: 410 });
}

export async function POST(request: Request) {
  const identity = await getRequestIdentity();
  const obs = observability(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const prohibited = ["salesAmount", "paymentStatus", "paymentMethod", "unpaidAmount", "receivableStatus", "collectedAmount", "stripe", "stripeSecret"]
    .filter((key) => key in body);
  if (prohibited.length) return NextResponse.json({ status: "error", error: { code: "PROHIBITED_FIELDS", message: `Velvet does not accept Sales/Payment fields: ${prohibited.join(", ")}` }, ...obs }, { status: 400 });

  const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
  const reservationId = typeof body.reservationId === "string" ? body.reservationId.trim() || undefined : undefined;
  const visitScheduleId = typeof body.visitScheduleId === "string" ? body.visitScheduleId.trim() || undefined : undefined;
  const intent = typeof body.intent === "string" ? body.intent.trim() || undefined : undefined;
  if (!customerId) return NextResponse.json({ status: "error", error: { code: "CUSTOMER_ID_REQUIRED", message: "customerId is required" }, ...obs }, { status: 400 });
  if (reservationId && visitScheduleId) return NextResponse.json({ status: "error", error: { code: "REFERENCE_CONFLICT", message: "Use reservationId or visitScheduleId, not both" }, ...obs }, { status: 400 });

  const visit = await startProfessionalVisit({ workspaceId: identity.workspaceId, userId: identity.userId, customerId, reservationId, visitScheduleId, serviceContext: intent });
  return NextResponse.json({
    status: "success",
    visitId: visit.id,
    workspaceId: visit.workspaceId,
    customerId: visit.customerId,
    eventName: "velvet.visit.started.v1",
    ...obs,
  }, { status: 201 });
}
