import { NextResponse } from "next/server";
import { createGift, listGifts, type GiftDirection } from "@/lib/gift-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export async function GET(request: Request) {
  const ownerUserId = getCurrentOwnerUserId();
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId") || undefined;
  return NextResponse.json({ status: "success", gifts: listGifts(ownerUserId, personId) });
}

export async function POST(request: Request) {
  const ownerUserId = getCurrentOwnerUserId();
  const body = await request.json().catch(() => ({}));
  const personId = typeof body.personId === "string" ? body.personId : "";
  const item = typeof body.item === "string" ? body.item : "";
  const direction = (body.direction === "given" ? "given" : "received") as GiftDirection;
  const estimatedValue = typeof body.estimatedValue === "number" ? body.estimatedValue : undefined;
  const occasion = typeof body.occasion === "string" ? body.occasion : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;

  const gift = createGift({ ownerUserId, personId, direction, item, estimatedValue, occasion, note });
  if (!gift) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_GIFT", message: "Gift could not be created." } }, { status: 400 });
  }
  return NextResponse.json({ status: "success", gift }, { status: 201 });
}
