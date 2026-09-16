import { NextResponse } from "next/server";
import { createGift, listGifts, type GiftDirection } from "@/lib/gift-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";

export async function GET(request: Request) {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const access = await getPlanAccess(ownerUserId);
  if (!hasVelvetFeature(access, "history.gifts")) return NextResponse.json({ status: "error", error: { code: "PRO_REQUIRED", message: "Gift history view is available on Pro." }, plan: access.plan }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId") || undefined;
  return NextResponse.json({ status: "success", gifts: await listGifts(workspaceId, userId, customerId) });
}

export async function POST(request: Request) {
  const { workspaceId, userId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({}));
  const customerId = typeof body.customerId === "string" ? body.customerId : "";
  const item = typeof body.item === "string" ? body.item : "";
  const direction = (body.direction === "given" ? "given" : "received") as GiftDirection;
  const occasion = typeof body.occasion === "string" ? body.occasion : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;
  const gift = await createGift({ workspaceId, userId, customerId, direction, item, occasion, note });
  if (!gift) return NextResponse.json({ status: "error", error: { code: "INVALID_GIFT", message: "Gift could not be created." } }, { status: 400 });
  return NextResponse.json({ status: "success", gift }, { status: 201 });
}
