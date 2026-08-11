import { NextResponse } from "next/server";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { endVisit, getVisit, updateVisit } from "@/lib/visit-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const ownerUserId = getCurrentOwnerUserId();
  const { visitId } = await params;
  const visit = await getVisit(visitId, ownerUserId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_FOUND", message: "visit not found" } }, { status: 404 });
  return NextResponse.json({ status: "success", visit });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const ownerUserId = getCurrentOwnerUserId();
  const { visitId } = await params;
  const body = await request.json().catch(() => ({}));
  const patch = {
    salesAmount: typeof body.salesAmount === "number" ? body.salesAmount : undefined,
    paymentMethod: ["cash", "card", "qr", "receivable", "other"].includes(body.paymentMethod) ? body.paymentMethod : undefined,
    seatingReason: typeof body.seatingReason === "string" && body.seatingReason.trim() ? body.seatingReason.trim() : undefined,
  } as const;
  const visit = await updateVisit(visitId, patch, ownerUserId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_EDITABLE", message: "visit not found or already ended" } }, { status: 409 });
  return NextResponse.json({ status: "success", visit });
}

export async function POST(request: Request, { params }: { params: Promise<{ visitId: string }> }) {
  const ownerUserId = getCurrentOwnerUserId();
  const { visitId } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.action !== "end") return NextResponse.json({ status: "error", error: { code: "INVALID_ACTION", message: "unsupported action" } }, { status: 400 });
  const visit = await endVisit(visitId, ownerUserId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "VISIT_NOT_FOUND", message: "visit not found" } }, { status: 404 });
  return NextResponse.json({ status: "success", visit });
}
