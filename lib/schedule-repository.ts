import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { addTimelineItemStore, getPersonStore } from "@/lib/person-store";

export type ScheduleKind = "shift" | "visit" | "birthday" | "unavailable" | "self_investment" | "other";
export type ScheduleEntry = {
  id: string;
  ownerUserId: string;
  personId?: string;
  kind: ScheduleKind;
  title: string;
  startsAt?: string;
  note?: string;
  createdAt: string;
};

const entries: ScheduleEntry[] = [];
const makeId = () => `schedule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

type ScheduleRow = { id: string; owner_user_id: string; person_id: string | null; entry_type: ScheduleKind; title: string; starts_at: string; note: string | null; created_at: string };
const mapRow = (row: ScheduleRow): ScheduleEntry => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  personId: row.person_id ?? undefined,
  kind: row.entry_type,
  title: row.title,
  startsAt: new Date(row.starts_at).toISOString(),
  note: row.note ?? undefined,
  createdAt: new Date(row.created_at).toISOString(),
});

export async function listScheduleEntries(ownerUserId = getCurrentOwnerUserId()) {
  if (getStorageMode() !== "postgres") {
    return entries.filter((entry) => entry.ownerUserId === ownerUserId).sort((a, b) => (a.startsAt ?? a.createdAt).localeCompare(b.startsAt ?? b.createdAt));
  }
  const result = await dbQuery<ScheduleRow>(
    "select id, owner_user_id, person_id, entry_type, title, starts_at::text, note, created_at::text from velvet_schedule_entries where owner_user_id = $1 order by starts_at",
    [ownerUserId],
  );
  return result.rows.map(mapRow);
}

export async function createScheduleEntry(values: Pick<ScheduleEntry, "kind" | "title"> & Partial<Pick<ScheduleEntry, "personId" | "startsAt" | "note">>, ownerUserId = getCurrentOwnerUserId()) {
  if (values.personId && !(await getPersonStore(values.personId, ownerUserId))) return undefined;
  const entry: ScheduleEntry = {
    id: makeId(), ownerUserId, kind: values.kind, title: values.title.trim(), personId: values.personId,
    startsAt: values.startsAt, note: values.note?.trim() || undefined, createdAt: new Date().toISOString(),
  };
  if (!entry.title) return undefined;
  if (getStorageMode() !== "postgres") entries.push(entry);
  else await dbQuery(
    "insert into velvet_schedule_entries (id, owner_user_id, person_id, entry_type, title, starts_at, note, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)",
    [entry.id, entry.ownerUserId, entry.personId ?? null, entry.kind, entry.title, entry.startsAt ?? entry.createdAt, entry.note ?? null, entry.createdAt],
  );
  if (entry.personId) {
    await addTimelineItemStore(entry.personId, { id: entry.id, date: (entry.startsAt ?? entry.createdAt).slice(0, 10), title: `予定 · ${entry.title}`, body: entry.note, eventType: "schedule", sourceRef: entry.id }, ownerUserId);
  }
  return entry;
}
