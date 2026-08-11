import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addTimelineItemStore, getPersonStore } from "@/lib/person-store";

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

type ReadOptions = { includeArchived?: boolean };
const gifts: Gift[] = [];
const makeId = () => `gift_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

type GiftRow = { id: string; owner_user_id: string; person_id: string; direction: GiftDirection; item: string; estimated_value: number | null; occasion: string | null; memo: string | null; occurred_at: string };
const mapGift = (row: GiftRow): Gift => ({
  id: row.id, ownerUserId: row.owner_user_id, personId: row.person_id, direction: row.direction, item: row.item,
  estimatedValue: row.estimated_value ?? undefined, occasion: row.occasion ?? undefined, note: row.memo ?? undefined,
  occurredAt: new Date(row.occurred_at).toISOString(),
});

export async function listGifts(ownerUserId: string, personId?: string, options: ReadOptions = {}): Promise<Gift[]> {
  const access = await getPlanAccess(ownerUserId);
  if (getStorageMode() !== "postgres") {
    return gifts.filter((gift) => gift.ownerUserId === ownerUserId && (!personId || gift.personId === personId) && (options.includeArchived || isWithinHistoryWindow(gift.occurredAt, access)));
  }
  const cutoff = options.includeArchived || access.fullHistory ? null : access.historyCutoff?.toISOString() ?? null;
  const rows = await dbQuery<GiftRow>(
    `select id, owner_user_id, person_id, direction, item, estimated_value, occasion, memo, occurred_at::text
     from velvet_gifts
     where owner_user_id = $1 and ($2::text is null or person_id = $2) and ($3::timestamptz is null or occurred_at >= $3)
     order by occurred_at desc`,
    [ownerUserId, personId ?? null, cutoff],
  );
  return rows.rows.map(mapGift);
}

export async function createGift(input: { ownerUserId: string; personId: string; direction: GiftDirection; item: string; estimatedValue?: number; occasion?: string; note?: string }): Promise<Gift | undefined> {
  const person = await getPersonStore(input.personId, input.ownerUserId);
  const item = input.item.trim();
  if (!person || !item) return undefined;
  const gift: Gift = { id: makeId(), ownerUserId: input.ownerUserId, personId: input.personId, direction: input.direction, item, estimatedValue: input.estimatedValue, occasion: input.occasion?.trim() || undefined, note: input.note?.trim() || undefined, occurredAt: new Date().toISOString() };
  if (getStorageMode() !== "postgres") gifts.unshift(gift);
  else await dbQuery(
    `insert into velvet_gifts (id, owner_user_id, person_id, direction, item, estimated_value, occasion, memo, occurred_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [gift.id, gift.ownerUserId, gift.personId, gift.direction, gift.item, gift.estimatedValue ?? null, gift.occasion ?? null, gift.note ?? null, gift.occurredAt],
  );
  const directionLabel = gift.direction === "received" ? "もらった" : "あげた";
  await addTimelineItemStore(input.personId, { id: gift.id, date: gift.occurredAt.slice(0, 10), title: `${directionLabel} · ${gift.item}`, body: [gift.occasion, gift.note].filter(Boolean).join(" · ") || undefined, eventType: "gift", sourceRef: gift.id }, input.ownerUserId);
  return gift;
}
