import { NextResponse } from "next/server";
import { createCapture, listCaptures, type CaptureKind } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

const allowedKinds: CaptureKind[] = [
  "knowledge", "drink", "work", "hobby", "appearance", "accessory", "marital_status", "conversation_note", "free_text",
];

export async function GET(request: Request) {
  const { ownerUserId } = await getRequestIdentity();
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId") || undefined;
  return NextResponse.json({ status: "success", captures: await listCaptures(ownerUserId, personId) });
}

export async function POST(request: Request) {
  const { ownerUserId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({}));
  const value = typeof body.value === "string" ? body.value : "";
  const personId = typeof body.personId === "string" ? body.personId : undefined;
  const rawKind = typeof body.kind === "string" ? body.kind : "free_text";
  if (!allowedKinds.includes(rawKind as CaptureKind)) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE_KIND", message: "Unsupported Capture kind." } }, { status: 400 });
  }
  const capture = await createCapture({ ownerUserId, personId, kind: rawKind as CaptureKind, value });
  if (!capture) return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE", message: "Capture could not be created." } }, { status: 400 });
  return NextResponse.json({ status: "success", capture }, { status: 201 });
}
