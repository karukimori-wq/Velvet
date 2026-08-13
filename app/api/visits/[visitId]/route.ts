import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import {
  endProfessionalVisit,
  getProfessionalVisit,
  updateProfessionalVisit,
} from "@/lib/professional-visit-repository";

function ids(request: Request) {
  const traceId = request.headers.get("x-trace-id") ?? crypto.randomUUID();
  const correlationId = request.headers.get("x-correlation-id") ?? traceId;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  return { traceId, correlationId, requestId };
}

export async function GET(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const { workspaceId, userId } = await getRequestIdentity();
  const { visitId } = await params;
  const observability = ids(request);
  const visit = await getProfessionalVisit(visitId, workspaceId, userId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_FOUND", message: "visit not found" }, ...observability }, { status: 404 });
  return NextResponse.json({ status: "success", visit, ...observability });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const { workspaceId, userId } = await getRequestIdentity();
  const { visitId } = await params;
  const observability = ids(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  const prohibited = ["salesAmount", "paymentStatus", "paymentMethod", "unpaidAmount", "receivableStatus", "collectedAmount", "stripe", "stripeSecret"]
    .filter((key) => key in body);
  if (prohibited.length) {
    return NextResponse.json({
      status: "error",
      error: { code: "PROHIBITED_FIELDS", message: `Velvet Visit does not accept Sales/Payment fields: ${prohibited.join(", ")}` },
      ...observability,
    }, { status: 400 });
  }

  const patch = {
    serviceContext: typeof body.serviceContext === "string" ? body.serviceContext.trim() || undefined : undefined,
    seatingReason: typeof body.seatingReason === "string" ? body.seatingReason.trim() || undefined : undefined,
    conversationMemo: typeof body.conversationMemo === "string" ? body.conversationMemo.trim() || undefined : undefined,
    preferenceMemo: typeof body.preferenceMemo === "string" ? body.preferenceMemo.trim() || undefined : undefined,
    cautionMemo: typeof body.cautionMemo === "string" ? body.cautionMemo.trim() || undefined : undefined,
    nextActionMemo: typeof body.nextActionMemo === "string" ? body.nextActionMemo.trim() || undefined : undefined,
    summary: typeof body.summary === "string" ? body.summary.trim() || undefined : undefined,
  };

  const visit = await updateProfessionalVisit(visitId, workspaceId, userId, patch);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_EDITABLE", message: "visit not found or already ended" }, ...observability }, { status: 409 });
  return NextResponse.json({ status: "success", visitId: visit.id, customerId: visit.customerId, ...observability });
}

export async function POST(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const { workspaceId, userId } = await getRequestIdentity();
  const { visitId } = await params;
  const observability = ids(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (body.action !== "end") return NextResponse.json({ status: "error", error: { code: "INVALID_ACTION", message: "unsupported action" }, ...observability }, { status: 400 });
  const visit = await endProfessionalVisit(visitId, workspaceId, userId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_FOUND", message: "visit not found" }, ...observability }, { status: 404 });
  return NextResponse.json({
    status: "success",
    visitId: visit.id,
    customerId: visit.customerId,
    lastVisitAt: visit.visitedAt,
    summaryRef: visit.summary ? `velvet:visit:${visit.id}:summary` : undefined,
    nextActionRef: visit.nextActionMemo ? `velvet:visit:${visit.id}:next-action` : undefined,
    eventName: "velvet.visit.completed.v1",
    ...observability,
  });
}
