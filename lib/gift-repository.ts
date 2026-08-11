import { getPerson, prependTimelineItem } from "@/lib/demo-data";

export type GiftDirection = "received" | "given";

export type Gift = {
  id: string;
  ownerUserId: string;
  personId: string;
  direction: GiftDirection;
  item: string;
  estimatedValue?: number;
  occasion?: string;
  note?: string;
  occurredAt: string;
};

const gifts: Gift[] = [];

function makeId() {
  return `gift_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listGifts(ownerUserId: string, personId?: string) {
  return gifts.filter((gift) => gift.ownerUserId === ownerUserId && (!personId || gift.personId === personId));
}

export function createGift(input: {
  ownerUserId: string;
  personId: string;
  direction: GiftDirection;
  item: string;
  estimatedValue?: number;
  occasion?: string;
  note?: string;
}) {
  const person = getPerson(input.personId, input.ownerUserId);
  const item = input.item.trim();
  if (!person || !item) return undefined;

  const gift: Gift = {
    id: makeId(),
    ownerUserId: input.ownerUserId,
    personId: input.personId,
    direction: input.direction,
    item,
    estimatedValue: input.estimatedValue,
    occasion: input.occasion?.trim() || undefined,
    note: input.note?.trim() || undefined,
    occurredAt: new Date().toISOString(),
  };
  gifts.unshift(gift);

  const directionLabel = gift.direction === "received" ? "もらった" : "あげた";
  prependTimelineItem(input.personId, {
    id: gift.id,
    date: gift.occurredAt.slice(0, 10),
    title: `${directionLabel} · ${gift.item}`,
    body: [gift.occasion, gift.note].filter(Boolean).join(" · ") || undefined,
  }, input.ownerUserId);

  return gift;
}
