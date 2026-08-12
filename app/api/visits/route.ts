import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { startProfessionalVisit } from "@/lib/professional-visit-repository";

export async function GET() {
  return NextResponse.json({
    status: "warning",
    message: "Use customer-scoped Professional Visit references. Velvet does not expose Sales/Payment visit ledgers.",
  }, { status: 410 });
}

export async function POST(request: Request) {
  const identity = await getRequestIdentity();
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
  const reservationId = typeof body.reservationId === "string" ? body.reservationId.trim() || undefined : undefined;
  const visitScheduleId = typeof body.visitScheduleId === "string" ? body.visitScheduleId.trim() || undefined : undefined;
  const intent = typeof body.intent === "string" ? body.intent.trim() || undefined : undefined;
  if (!customerId) return NextResponse.json({ status: "error", error: { code: "CUSTOMER_ID_REQUIRED", message: "customerId is required" } }, { status: 400 });
  if (reservationId && visitScheduleId) return NextResponse.json({ status: "error", error: { code: "REFERENCE_CONFLICT", message: "Use reservationId or visitScheduleId, not both" } }, { status: 400 });
  const visit = await startProfessionalVisit({ workspaceId: identity.workspaceId, userId: identity.userId, customerId, reservationId, visitScheduleId, serviceContext: intent });
  return NextResponse.json({ status: "success", visitId: visit.id, customerId: visit.customerId }, { status: 201 });
}
