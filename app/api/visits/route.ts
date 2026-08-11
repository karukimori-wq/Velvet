import { NextResponse } from "next/server";
import { listVisits, startVisit } from "@/lib/visit-repository";

const OWNER = "user_demo_owner";

export async function GET() {
  return NextResponse.json({ status: "success", visits: listVisits(OWNER) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const personId = typeof body.personId === "string" ? body.personId : "";
  const visit = startVisit(personId, OWNER);
  if (!visit) {
    return NextResponse.json({ status: "error", error: { code: "PERSON_NOT_FOUND", message: "person not found" } }, { status: 404 });
  }
  return NextResponse.json({ status: "success", visit }, { status: 201 });
}
