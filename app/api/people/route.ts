import { NextResponse } from "next/server";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { createPersonStore, listPeopleStore } from "@/lib/person-store";

export async function GET() {
  const ownerUserId = getCurrentOwnerUserId();
  return NextResponse.json({ status: "success", people: await listPeopleStore(ownerUserId) });
}

export async function POST(request: Request) {
  const ownerUserId = getCurrentOwnerUserId();
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ status: "error", error: { code: "INVALID_NAME", message: "name is required" } }, { status: 400 });
  const person = await createPersonStore(name, ownerUserId);
  return NextResponse.json({ status: "success", person }, { status: 201 });
}
