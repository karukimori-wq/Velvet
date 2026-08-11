import { addPersonKnowledgeStore, createPersonStore, listPeopleStore, updatePersonBasicsStore } from "@/lib/person-store";
import { getStorageMode } from "@/lib/storage/config";
import { withTransaction } from "@/lib/storage/postgres";

export type VelvetImportPerson = {
  name: string;
  rank?: string;
  personality?: string[];
};

export type VelvetImportPayload = {
  version: "1.0";
  people: VelvetImportPerson[];
};

export type DuplicatePolicy = "skip" | "create_separate";

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("ja-JP");
}

export async function exportVelvetData(ownerUserId: string) {
  // Export is deliberately not constrained by the Free UI history window.
  // Users must be able to retrieve their own archived data.
  const people = await listPeopleStore(ownerUserId, { includeArchived: true });
  return {
    version: "1.0" as const,
    exportedAt: new Date().toISOString(),
    people: people.map((person) => ({
      name: person.name,
      rank: person.rank,
      personality: person.personality,
      timeline: person.timeline,
    })),
  };
}

export function validateImportPayload(input: unknown): { ok: true; data: VelvetImportPayload } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "JSONオブジェクトではありません" };
  const payload = input as Partial<VelvetImportPayload>;
  if (payload.version !== "1.0") return { ok: false, error: "version は 1.0 が必要です" };
  if (!Array.isArray(payload.people)) return { ok: false, error: "people 配列が必要です" };
  for (const [index, person] of payload.people.entries()) {
    if (!person || typeof person !== "object" || typeof person.name !== "string" || !person.name.trim()) {
      return { ok: false, error: `people[${index}].name が必要です` };
    }
    if (person.rank !== undefined && typeof person.rank !== "string") {
      return { ok: false, error: `people[${index}].rank は文字列にしてください` };
    }
    if (person.personality !== undefined && (!Array.isArray(person.personality) || person.personality.some((value) => typeof value !== "string"))) {
      return { ok: false, error: `people[${index}].personality は文字列配列にしてください` };
    }
  }
  return { ok: true, data: payload as VelvetImportPayload };
}

export async function importVelvetData(payload: VelvetImportPayload, ownerUserId: string, duplicatePolicy: DuplicatePolicy) {
  if (getStorageMode() !== "postgres") {
    const existingNames = new Set((await listPeopleStore(ownerUserId, { includeArchived: true })).map((person) => normalizeName(person.name)));
    const createdIds: string[] = [];
    const skippedNames: string[] = [];
    for (const item of payload.people) {
      const normalized = normalizeName(item.name);
      if (duplicatePolicy === "skip" && existingNames.has(normalized)) {
        skippedNames.push(item.name.trim());
        continue;
      }
      const person = await createPersonStore(item.name, ownerUserId);
      if (item.rank) await updatePersonBasicsStore(person.id, { rank: item.rank }, ownerUserId);
      if (item.personality?.length) await addPersonKnowledgeStore(person.id, item.personality.join("、"), ownerUserId);
      existingNames.add(normalized);
      createdIds.push(person.id);
    }
    return { createdIds, skippedNames };
  }

  return withTransaction(async (client) => {
    const existing = await client.query<{ name: string }>("select name from velvet_people where owner_user_id = $1", [ownerUserId]);
    const existingNames = new Set(existing.rows.map((row) => normalizeName(row.name)));
    const createdIds: string[] = [];
    const skippedNames: string[] = [];

    for (const item of payload.people) {
      const name = item.name.trim();
      const normalized = normalizeName(name);
      if (duplicatePolicy === "skip" && existingNames.has(normalized)) {
        skippedNames.push(name);
        continue;
      }

      const personId = makeId("person");
      await client.query(
        "insert into velvet_people (id, owner_user_id, name, rank) values ($1,$2,$3,$4)",
        [personId, ownerUserId, name, item.rank?.trim() || null],
      );

      const values = Array.from(new Set((item.personality ?? []).map((value) => value.trim()).filter(Boolean)));
      for (const value of values) {
        await client.query(
          "insert into velvet_knowledge (id, owner_user_id, person_id, value) values ($1,$2,$3,$4)",
          [makeId("knowledge"), ownerUserId, personId, value],
        );
      }

      existingNames.add(normalized);
      createdIds.push(personId);
    }

    return { createdIds, skippedNames };
  });
}
