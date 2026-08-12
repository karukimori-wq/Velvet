import { NextResponse } from "next/server";
import { createCapture, listCaptures, type CaptureKind } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

const allowedKinds: CaptureKind[] = ["knowledge", "drink", "work", "hobby", "appearance", "accessory", "marital_status", "conversation_note", "free_text"];

export async function GET(request: Request) {
  const { workspaceId, userId } = await getRequestIdentity();
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || undefined;
  return NextResponse.json({ status: "success", captures: await listCaptures(workspaceId, userId, customerId) });
}

export async function POST(request: Request) {
  const { workspaceId, userId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({}));
  const value = typeof body.value === "string" ? body.value : "";
  const customerId = typeof body.customerId === "string" ? body.customerId : undefined;
  const rawKind = typeof body.kind === "string" ? body.kind : "free_text";
  if (!allowedKinds.includes(rawKind as CaptureKind)) return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE_KIND", message: "Unsupported Capture kind." } }, { status: 400 });
  const capture = await createCapture({ workspaceId, userId, customerId, kind: rawKind as CaptureKind, value });
  if (!capture) return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE", message: "Capture could not be created." } }, { status: 400 });
  return NextResponse.json({ status: "success", capture }, { status: 201 });
}
