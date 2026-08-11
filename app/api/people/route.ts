import { NextResponse } from "next/server";
import { createPerson, listPeople } from "@/lib/demo-data";

const OWNER = "user_demo_owner";

export async function GET() {
  return NextResponse.json({ status: "success", people: listPeople(OWNER) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_NAME", message: "name is required" } }, { status: 400 });
  }
  const person = createPerson(name, OWNER);
  return NextResponse.json({ status: "success", person }, { status: 201 });
}
