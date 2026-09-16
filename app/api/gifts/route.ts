import { NextResponse } from "next/server";
import { createGift, listGifts, type GiftDirection } from "@/lib/gift-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";
import { INPUT_LIMITS } from "@/lib/input-limits";

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
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
  const item = typeof body.item === "string" ? body.item.trim() : "";
  if (!customerId || !item) return NextResponse.json({ status: "error", error: { code: "INVALID_GIFT", message: "customerId and item are required." } }, { status: 400 });
  if (body.direction !== "given" && body.direction !== "received") return NextResponse.json({ status: "error", error: { code: "INVALID_GIFT_DIRECTION", message: "direction must be given or received." } }, { status: 400 });
  const direction = body.direction as GiftDirection;
  const occasion = typeof body.occasion === "string" ? body.occasion.trim() : undefined;
  const note = typeof body.note === "string" ? body.note.trim() : undefined;
  if(item.length>INPUT_LIMITS.giftItem||(occasion?.length??0)>INPUT_LIMITS.giftOccasion||(note?.length??0)>INPUT_LIMITS.giftNote)return NextResponse.json({status:"error",error:{code:"GIFT_TOO_LONG",message:"Gift fields exceed the supported size."}},{status:400});
  const gift = await createGift({ workspaceId, userId, customerId, direction, item, occasion, note });
  if (!gift) return NextResponse.json({ status: "error", error: { code: "INVALID_GIFT", message: "Gift could not be created." } }, { status: 400 });
  return NextResponse.json({ status: "success", gift }, { status: 201 });
}
