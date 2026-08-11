import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createPersonContact, listContacts, type ContactType } from "@/lib/contact-repository";

const allowed: ContactType[] = ["phone", "email", "line", "instagram", "x", "tiktok", "other"];

export async function GET() {
  const { ownerUserId } = await getRequestIdentity();
  return Response.json({ status: "success", contacts: await listContacts(ownerUserId) });
}

export async function POST(request: Request) {
  const { ownerUserId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({}));
  const personId = typeof body.personId === "string" ? body.personId.trim() : "";
  const value = typeof body.value === "string" ? body.value.trim() : "";
  const type = allowed.includes(body.type as ContactType) ? (body.type as ContactType) : "other";
  if (!personId || !value) {
    return Response.json({ status: "error", error: { code: "INVALID_CONTACT", message: "personId and value are required" } }, { status: 400 });
  }
  const contact = await createPersonContact({
    personId,
    type,
    value,
    label: typeof body.label === "string" ? body.label : undefined,
    isPrimary: body.isPrimary === true,
  }, ownerUserId);
  if (!contact) return Response.json({ status: "error", error: { code: "PERSON_NOT_FOUND", message: "person not found" } }, { status: 404 });
  return Response.json({ status: "success", contact }, { status: 201 });
}
