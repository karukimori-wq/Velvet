import { addPersonKnowledgeStore, createPersonStore, listPeopleStore, updatePersonBasicsStore } from "@/lib/person-store";

export type VelvetImportPerson = {
  name: string;
  rank?: string;
  personality?: string[];
};

export type VelvetImportPayload = {
  version: "1.0";
  people: VelvetImportPerson[];
};

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
    if (person.personality !== undefined && (!Array.isArray(person.personality) || person.personality.some((value) => typeof value !== "string"))) {
      return { ok: false, error: `people[${index}].personality は文字列配列にしてください` };
    }
  }
  return { ok: true, data: payload as VelvetImportPayload };
}

export async function importVelvetData(payload: VelvetImportPayload, ownerUserId: string) {
  const createdIds: string[] = [];
  for (const item of payload.people) {
    const person = await createPersonStore(item.name, ownerUserId);
    if (item.rank) await updatePersonBasicsStore(person.id, { rank: item.rank }, ownerUserId);
    if (item.personality?.length) await addPersonKnowledgeStore(person.id, item.personality.join("、"), ownerUserId);
    createdIds.push(person.id);
  }
  return createdIds;
}
