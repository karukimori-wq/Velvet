import { addPersonKnowledgeStore, createPersonStore, listPeopleStore, updatePersonBasicsStore } from "@/lib/person-store";
import { createPersonContact, listContacts, type ContactType } from "@/lib/contact-repository";
import { listAllPersonProfiles, upsertPersonProfile, type MaritalStatus } from "@/lib/person-profile-repository";
import { getStorageMode } from "@/lib/storage/config";
import { withTransaction } from "@/lib/storage/postgres";

export type VelvetImportContact = {
  type: ContactType;
  value: string;
  label?: string;
  isPrimary?: boolean;
};

export type VelvetImportProfile = {
  birthDate?: string;
  occupation?: string;
  company?: string;
  area?: string;
  maritalStatus?: MaritalStatus;
};

export type VelvetImportPerson = {
  name: string;
  rank?: string;
  personality?: string[];
  contacts?: VelvetImportContact[];
  profile?: VelvetImportProfile;
};

export type VelvetImportPayload = {
  version: "1.0";
  people: VelvetImportPerson[];
};

export type DuplicatePolicy = "skip" | "create_separate";

const allowedContactTypes: ContactType[] = ["phone", "email", "line", "instagram", "x", "tiktok", "other"];
const allowedMaritalStatuses: MaritalStatus[] = ["unmarried", "married", "unknown"];

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("ja-JP");
}

export async function exportVelvetData(ownerUserId: string) {
  const [people, contacts, profiles] = await Promise.all([
    listPeopleStore(ownerUserId, { includeArchived: true }),
    listContacts(ownerUserId),
    listAllPersonProfiles(ownerUserId),
  ]);
  const contactsByPerson = new Map<string, VelvetImportContact[]>();
  for (const contact of contacts) {
    const list = contactsByPerson.get(contact.personId) ?? [];
    list.push({ type: contact.type, value: contact.value, label: contact.label, isPrimary: contact.isPrimary });
    contactsByPerson.set(contact.personId, list);
  }
  const profileByPerson = new Map(profiles.map((profile) => [profile.personId, {
    birthDate: profile.birthDate,
    occupation: profile.occupation,
    company: profile.company,
    area: profile.area,
    maritalStatus: profile.maritalStatus,
  }]));
  return {
    version: "1.0" as const,
    exportedAt: new Date().toISOString(),
    people: people.map((person) => ({
      name: person.name,
      rank: person.rank,
      profile: profileByPerson.get(person.id),
      personality: person.personality,
      contacts: contactsByPerson.get(person.id) ?? [],
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
    if (person.rank !== undefined && typeof person.rank !== "string") return { ok: false, error: `people[${index}].rank は文字列にしてください` };
    if (person.personality !== undefined && (!Array.isArray(person.personality) || person.personality.some((value) => typeof value !== "string"))) {
      return { ok: false, error: `people[${index}].personality は文字列配列にしてください` };
    }
    if (person.profile !== undefined) {
      if (!person.profile || typeof person.profile !== "object") return { ok: false, error: `people[${index}].profile を確認してください` };
      const profile = person.profile;
      for (const field of ["birthDate", "occupation", "company", "area"] as const) {
        if (profile[field] !== undefined && typeof profile[field] !== "string") return { ok: false, error: `people[${index}].profile.${field} は文字列にしてください` };
      }
      if (profile.maritalStatus !== undefined && !allowedMaritalStatuses.includes(profile.maritalStatus)) {
        return { ok: false, error: `people[${index}].profile.maritalStatus を確認してください` };
      }
    }
    if (person.contacts !== undefined) {
      if (!Array.isArray(person.contacts)) return { ok: false, error: `people[${index}].contacts は配列にしてください` };
      for (const [contactIndex, contact] of person.contacts.entries()) {
        if (!contact || typeof contact !== "object" || !allowedContactTypes.includes(contact.type) || typeof contact.value !== "string" || !contact.value.trim()) {
          return { ok: false, error: `people[${index}].contacts[${contactIndex}] の type/value を確認してください` };
        }
      }
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
      if (item.profile) await upsertPersonProfile(person.id, item.profile, ownerUserId);
      if (item.personality?.length) await addPersonKnowledgeStore(person.id, item.personality.join("、"), ownerUserId);
      for (const contact of item.contacts ?? []) await createPersonContact({ personId: person.id, ...contact }, ownerUserId);
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
      await client.query("insert into velvet_people (id, owner_user_id, name, rank) values ($1,$2,$3,$4)", [personId, ownerUserId, name, item.rank?.trim() || null]);

      if (item.profile) {
        await client.query(
          `insert into velvet_person_profiles (owner_user_id, person_id, birth_date, occupation, company, area, marital_status)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [ownerUserId, personId, item.profile.birthDate?.trim() || null, item.profile.occupation?.trim() || null, item.profile.company?.trim() || null, item.profile.area?.trim() || null, item.profile.maritalStatus ?? null],
        );
      }

      const values = Array.from(new Set((item.personality ?? []).map((value) => value.trim()).filter(Boolean)));
      for (const value of values) {
        await client.query("insert into velvet_knowledge (id, owner_user_id, person_id, value) values ($1,$2,$3,$4)", [makeId("knowledge"), ownerUserId, personId, value]);
      }

      for (const contact of item.contacts ?? []) {
        if (contact.isPrimary) {
          await client.query("update velvet_person_contacts set is_primary = false, updated_at = now() where owner_user_id = $1 and person_id = $2 and contact_type = $3", [ownerUserId, personId, contact.type]);
        }
        await client.query(
          `insert into velvet_person_contacts (id, owner_user_id, person_id, contact_type, label, value, is_primary)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [makeId("contact"), ownerUserId, personId, contact.type, contact.label?.trim() || null, contact.value.trim(), Boolean(contact.isPrimary)],
        );
      }

      existingNames.add(normalized);
      createdIds.push(personId);
    }

    return { createdIds, skippedNames };
  });
}
