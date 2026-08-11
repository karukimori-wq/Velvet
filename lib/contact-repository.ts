import { getStorageMode } from "@/lib/storage/config";
import { dbQuery } from "@/lib/storage/postgres";
import { getPersonStore } from "@/lib/person-store";

export type ContactType = "phone" | "email" | "line" | "instagram" | "x" | "tiktok" | "other";
export type PersonContact = {
  id: string;
  ownerUserId: string;
  personId: string;
  type: ContactType;
  label?: string;
  value: string;
  isPrimary: boolean;
  createdAt: string;
};

const memoryContacts: PersonContact[] = [];
const makeId = () => `contact_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

type ContactRow = {
  id: string;
  owner_user_id: string;
  person_id: string;
  contact_type: ContactType;
  label: string | null;
  value: string;
  is_primary: boolean;
  created_at: string;
};

const mapRow = (row: ContactRow): PersonContact => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  personId: row.person_id,
  type: row.contact_type,
  label: row.label ?? undefined,
  value: row.value,
  isPrimary: row.is_primary,
  createdAt: new Date(row.created_at).toISOString(),
});

export async function listPersonContacts(personId: string, ownerUserId: string): Promise<PersonContact[]> {
  if (!(await getPersonStore(personId, ownerUserId))) return [];
  if (getStorageMode() !== "postgres") {
    return memoryContacts.filter((item) => item.ownerUserId === ownerUserId && item.personId === personId);
  }
  const result = await dbQuery<ContactRow>(
    `select id, owner_user_id, person_id, contact_type, label, value, is_primary, created_at::text
     from velvet_person_contacts where owner_user_id = $1 and person_id = $2
     order by is_primary desc, created_at`,
    [ownerUserId, personId],
  );
  return result.rows.map(mapRow);
}

export async function createPersonContact(values: { personId: string; type: ContactType; value: string; label?: string; isPrimary?: boolean }, ownerUserId: string) {
  if (!(await getPersonStore(values.personId, ownerUserId))) return undefined;
  const value = values.value.trim();
  if (!value) return undefined;
  const contact: PersonContact = {
    id: makeId(), ownerUserId, personId: values.personId, type: values.type, value,
    label: values.label?.trim() || undefined, isPrimary: Boolean(values.isPrimary), createdAt: new Date().toISOString(),
  };
  if (getStorageMode() !== "postgres") {
    if (contact.isPrimary) {
      for (const item of memoryContacts) if (item.ownerUserId === ownerUserId && item.personId === values.personId && item.type === values.type) item.isPrimary = false;
    }
    memoryContacts.push(contact);
    return contact;
  }
  if (contact.isPrimary) {
    await dbQuery(`update velvet_person_contacts set is_primary = false, updated_at = now() where owner_user_id = $1 and person_id = $2 and contact_type = $3`, [ownerUserId, values.personId, values.type]);
  }
  await dbQuery(
    `insert into velvet_person_contacts (id, owner_user_id, person_id, contact_type, label, value, is_primary)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [contact.id, ownerUserId, values.personId, values.type, contact.label ?? null, contact.value, contact.isPrimary],
  );
  return contact;
}

export async function deletePersonContact(contactId: string, ownerUserId: string) {
  if (getStorageMode() !== "postgres") {
    const index = memoryContacts.findIndex((item) => item.id === contactId && item.ownerUserId === ownerUserId);
    if (index < 0) return false;
    memoryContacts.splice(index, 1);
    return true;
  }
  const result = await dbQuery(`delete from velvet_person_contacts where id = $1 and owner_user_id = $2`, [contactId, ownerUserId]);
  return Boolean(result.rowCount);
}
