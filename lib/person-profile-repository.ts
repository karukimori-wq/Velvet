import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getPersonStore } from "@/lib/person-store";

export type MaritalStatus = "unmarried" | "married" | "unknown";
export type PersonProfile = {
  ownerUserId: string;
  personId: string;
  birthDate?: string;
  occupation?: string;
  company?: string;
  area?: string;
  maritalStatus?: MaritalStatus;
};

const memoryProfiles = new Map<string, PersonProfile>();
const key = (ownerUserId: string, personId: string) => `${ownerUserId}:${personId}`;

type ProfileRow = {
  owner_user_id: string;
  person_id: string;
  birth_date: string | null;
  occupation: string | null;
  company: string | null;
  area: string | null;
  marital_status: MaritalStatus | null;
};

function mapRow(row: ProfileRow): PersonProfile {
  return {
    ownerUserId: row.owner_user_id,
    personId: row.person_id,
    birthDate: row.birth_date ?? undefined,
    occupation: row.occupation ?? undefined,
    company: row.company ?? undefined,
    area: row.area ?? undefined,
    maritalStatus: row.marital_status ?? undefined,
  };
}

export async function getPersonProfile(personId: string, ownerUserId: string): Promise<PersonProfile | undefined> {
  if (!(await getPersonStore(personId, ownerUserId))) return undefined;
  if (getStorageMode() !== "postgres") return memoryProfiles.get(key(ownerUserId, personId));
  const result = await dbQuery<ProfileRow>(
    `select owner_user_id, person_id, birth_date::text, occupation, company, area, marital_status
     from velvet_person_profiles where owner_user_id = $1 and person_id = $2 limit 1`,
    [ownerUserId, personId],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : undefined;
}

export async function upsertPersonProfile(
  personId: string,
  values: Partial<Pick<PersonProfile, "birthDate" | "occupation" | "company" | "area" | "maritalStatus">>,
  ownerUserId: string,
) {
  if (!(await getPersonStore(personId, ownerUserId))) return undefined;
  const profile: PersonProfile = {
    ownerUserId,
    personId,
    birthDate: values.birthDate?.trim() || undefined,
    occupation: values.occupation?.trim() || undefined,
    company: values.company?.trim() || undefined,
    area: values.area?.trim() || undefined,
    maritalStatus: values.maritalStatus,
  };

  if (getStorageMode() !== "postgres") {
    memoryProfiles.set(key(ownerUserId, personId), profile);
    return profile;
  }

  await dbQuery(
    `insert into velvet_person_profiles (owner_user_id, person_id, birth_date, occupation, company, area, marital_status)
     values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (owner_user_id, person_id) do update set
       birth_date = excluded.birth_date,
       occupation = excluded.occupation,
       company = excluded.company,
       area = excluded.area,
       marital_status = excluded.marital_status,
       updated_at = now()`,
    [
      ownerUserId,
      personId,
      profile.birthDate ?? null,
      profile.occupation ?? null,
      profile.company ?? null,
      profile.area ?? null,
      profile.maritalStatus ?? null,
    ],
  );
  return getPersonProfile(personId, ownerUserId);
}

export async function listAllPersonProfiles(ownerUserId: string): Promise<PersonProfile[]> {
  if (getStorageMode() !== "postgres") {
    return Array.from(memoryProfiles.values()).filter((profile) => profile.ownerUserId === ownerUserId);
  }
  const result = await dbQuery<ProfileRow>(
    `select owner_user_id, person_id, birth_date::text, occupation, company, area, marital_status
     from velvet_person_profiles where owner_user_id = $1`,
    [ownerUserId],
  );
  return result.rows.map(mapRow);
}
