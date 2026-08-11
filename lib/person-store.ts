import {
  addPersonKnowledge as addMemoryKnowledge,
  createPerson as createMemoryPerson,
  getPerson as getMemoryPerson,
  listPeople as listMemoryPeople,
  removePersonKnowledge as removeMemoryKnowledge,
  updatePersonBasics as updateMemoryPersonBasics,
  type Person,
  type TimelineItem,
} from "./demo-data";
import { getStorageMode } from "./storage/config";
import { dbQuery, withTransaction } from "./storage/postgres";

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

type PersonRow = {
  id: string;
  owner_user_id: string;
  name: string;
  rank: string | null;
  last_visit: string | null;
  next_visit: string | null;
};

type KnowledgeRow = { person_id: string; value: string };
type TimelineRow = { person_id: string; id: string; occurred_at: string; title: string; body: string | null };

function toDateLabel(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : undefined;
}

function mapRows(rows: PersonRow[], knowledgeRows: KnowledgeRow[], timelineRows: TimelineRow[]): Person[] {
  const knowledge = new Map<string, string[]>();
  for (const row of knowledgeRows) {
    const list = knowledge.get(row.person_id) ?? [];
    list.push(row.value);
    knowledge.set(row.person_id, list);
  }

  const timeline = new Map<string, TimelineItem[]>();
  for (const row of timelineRows) {
    const list = timeline.get(row.person_id) ?? [];
    list.push({
      id: row.id,
      date: toDateLabel(row.occurred_at) ?? "",
      title: row.title,
      body: row.body ?? undefined,
    });
    timeline.set(row.person_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    rank: row.rank ?? undefined,
    lastVisit: toDateLabel(row.last_visit),
    nextVisit: row.next_visit ? new Date(row.next_visit).toISOString() : undefined,
    personality: knowledge.get(row.id) ?? [],
    timeline: timeline.get(row.id) ?? [],
  }));
}

export async function listPeopleStore(ownerUserId: string): Promise<Person[]> {
  if (getStorageMode() !== "postgres") return listMemoryPeople(ownerUserId);
  const [people, knowledge, timeline] = await Promise.all([
    dbQuery<PersonRow>(`select id, owner_user_id, name, rank, last_visit::text, next_visit::text from velvet_people where owner_user_id = $1 order by updated_at desc, name`, [ownerUserId]),
    dbQuery<KnowledgeRow>(`select person_id, value from velvet_knowledge where owner_user_id = $1 order by created_at`, [ownerUserId]),
    dbQuery<TimelineRow>(`select person_id, id, occurred_at::text, title, body from velvet_timeline_items where owner_user_id = $1 order by occurred_at desc`, [ownerUserId]),
  ]);
  return mapRows(people.rows, knowledge.rows, timeline.rows);
}

export async function getPersonStore(personId: string, ownerUserId: string): Promise<Person | undefined> {
  if (getStorageMode() !== "postgres") return getMemoryPerson(personId, ownerUserId);
  const people = await dbQuery<PersonRow>(`select id, owner_user_id, name, rank, last_visit::text, next_visit::text from velvet_people where id = $1 and owner_user_id = $2 limit 1`, [personId, ownerUserId]);
  if (!people.rows[0]) return undefined;
  const [knowledge, timeline] = await Promise.all([
    dbQuery<KnowledgeRow>(`select person_id, value from velvet_knowledge where person_id = $1 and owner_user_id = $2 order by created_at`, [personId, ownerUserId]),
    dbQuery<TimelineRow>(`select person_id, id, occurred_at::text, title, body from velvet_timeline_items where person_id = $1 and owner_user_id = $2 order by occurred_at desc`, [personId, ownerUserId]),
  ]);
  return mapRows(people.rows, knowledge.rows, timeline.rows)[0];
}

export async function createPersonStore(name: string, ownerUserId: string): Promise<Person> {
  if (getStorageMode() !== "postgres") return createMemoryPerson(name, ownerUserId);
  const id = makeId("person");
  await dbQuery(`insert into velvet_people (id, owner_user_id, name) values ($1, $2, $3)`, [id, ownerUserId, name.trim()]);
  return { id, ownerUserId, name: name.trim(), personality: [], timeline: [] };
}

export async function updatePersonBasicsStore(personId: string, values: { name?: string; rank?: string }, ownerUserId: string) {
  if (getStorageMode() !== "postgres") return updateMemoryPersonBasics(personId, values, ownerUserId);
  const name = values.name?.trim();
  const rank = values.rank?.trim() || null;
  const result = await dbQuery<PersonRow>(
    `update velvet_people set name = coalesce($3, name), rank = $4, updated_at = now() where id = $1 and owner_user_id = $2 returning id, owner_user_id, name, rank, last_visit::text, next_visit::text`,
    [personId, ownerUserId, name || null, rank],
  );
  return result.rows[0] ? getPersonStore(personId, ownerUserId) : undefined;
}

export async function addPersonKnowledgeStore(personId: string, rawValue: string, ownerUserId: string) {
  if (getStorageMode() !== "postgres") return addMemoryKnowledge(personId, rawValue, ownerUserId);
  const person = await getPersonStore(personId, ownerUserId);
  if (!person) return undefined;
  const values = rawValue.split(/[、,\n]/).map((value) => value.trim()).filter(Boolean);
  await withTransaction(async (client) => {
    for (const value of values) {
      const existing = await client.query(`select 1 from velvet_knowledge where owner_user_id = $1 and person_id = $2 and value = $3 limit 1`, [ownerUserId, personId, value]);
      if (existing.rowCount) continue;
      await client.query(`insert into velvet_knowledge (id, owner_user_id, person_id, value) values ($1, $2, $3, $4)`, [makeId("knowledge"), ownerUserId, personId, value]);
    }
    await client.query(`update velvet_people set updated_at = now() where id = $1 and owner_user_id = $2`, [personId, ownerUserId]);
  });
  return getPersonStore(personId, ownerUserId);
}

export async function removePersonKnowledgeStore(personId: string, value: string, ownerUserId: string) {
  if (getStorageMode() !== "postgres") return removeMemoryKnowledge(personId, value, ownerUserId);
  await dbQuery(`delete from velvet_knowledge where owner_user_id = $1 and person_id = $2 and value = $3`, [ownerUserId, personId, value]);
  return getPersonStore(personId, ownerUserId);
}

export async function addTimelineItemStore(personId: string, item: { id?: string; date?: string; title: string; body?: string; eventType?: string; sourceRef?: string }, ownerUserId: string) {
  if (getStorageMode() !== "postgres") {
    const person = getMemoryPerson(personId, ownerUserId);
    if (!person) return undefined;
    person.timeline.unshift({ id: item.id ?? makeId("timeline"), date: item.date ?? new Date().toISOString().slice(0, 10), title: item.title, body: item.body });
    return person;
  }
  const id = item.id ?? makeId("timeline");
  const occurredAt = item.date ? new Date(`${item.date}T12:00:00.000Z`) : new Date();
  await dbQuery(
    `insert into velvet_timeline_items (id, owner_user_id, person_id, occurred_at, event_type, title, body, source_ref) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do nothing`,
    [id, ownerUserId, personId, occurredAt.toISOString(), item.eventType ?? "note", item.title, item.body ?? null, item.sourceRef ?? null],
  );
  return getPersonStore(personId, ownerUserId);
}
