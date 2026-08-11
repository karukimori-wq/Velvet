import { currentOwnerUserId } from "@/lib/current-owner";
import { getPerson, pushTimelineItem } from "@/lib/demo-data";

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

function makeId() {
  return `schedule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listScheduleEntries(ownerUserId = currentOwnerUserId()) {
  return entries
    .filter((entry) => entry.ownerUserId === ownerUserId)
    .sort((a, b) => (a.startsAt ?? a.createdAt).localeCompare(b.startsAt ?? b.createdAt));
}

export function createScheduleEntry(
  values: Pick<ScheduleEntry, "kind" | "title"> & Partial<Pick<ScheduleEntry, "personId" | "startsAt" | "note">>,
  ownerUserId = currentOwnerUserId(),
) {
  if (values.personId && !getPerson(values.personId, ownerUserId)) return undefined;
  const entry: ScheduleEntry = {
    id: makeId(),
    ownerUserId,
    kind: values.kind,
    title: values.title.trim(),
    personId: values.personId,
    startsAt: values.startsAt,
    note: values.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  if (entry.personId) {
    pushTimelineItem(entry.personId, {
      id: entry.id,
      date: (entry.startsAt ?? entry.createdAt).slice(0, 10),
      title: `予定 · ${entry.title}`,
      body: entry.note,
    }, ownerUserId);
  }
  return entry;
}
