import { NextResponse } from "next/server";
import { createCapture, listCaptures, type CaptureKind } from "@/lib/capture-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function GET(request: Request) {
  const ownerUserId = getCurrentOwnerUserId();
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId") || undefined;
  return NextResponse.json({ status: "success", captures: listCaptures(ownerUserId, personId) });
}

export async function POST(request: Request) {
  const ownerUserId = getCurrentOwnerUserId();
  const body = await request.json().catch(() => ({}));
  const value = typeof body.value === "string" ? body.value : "";
  const personId = typeof body.personId === "string" ? body.personId : undefined;
  const kind = (typeof body.kind === "string" ? body.kind : "free_text") as CaptureKind;

  const capture = createCapture({ ownerUserId, personId, kind, value });
  if (!capture) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE", message: "Capture could not be created." } }, { status: 400 });
  }
  return NextResponse.json({ status: "success", capture }, { status: 201 });
}
