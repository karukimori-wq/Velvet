import { NextResponse } from "next/server";
import { createCapture, listCaptures, type CaptureKind } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";

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
  const kind = (typeof body.kind === "string" ? body.kind : "free_text") as CaptureKind;
  const capture = await createCapture({ ownerUserId, personId, kind, value });
  if (!capture) return NextResponse.json({ status: "error", error: { code: "INVALID_CAPTURE", message: "Capture could not be created." } }, { status: 400 });
  return NextResponse.json({ status: "success", capture }, { status: 201 });
}
