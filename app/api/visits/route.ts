import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listVisits, startVisit } from "@/lib/visit-repository";

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  return NextResponse.json({ status: "success", visits: await listVisits(ownerUserId) });
}

export async function POST(request: Request) {
  const { ownerUserId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({}));
  const personId = typeof body.personId === "string" ? body.personId : "";
  const visit = await startVisit(personId, ownerUserId);
  if (!visit) return NextResponse.json({ status: "error", error: { code: "PERSON_NOT_FOUND", message: "person not found" } }, { status: 404 });
  return NextResponse.json({ status: "success", visit }, { status: 201 });
}
