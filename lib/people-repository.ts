import type { Person } from "./demo-data";
import { getPersonStore, listPeopleStore } from "./person-store";

export type PeopleQuery = {
  ownerUserId: string;
  q?: string;
};

/**
 * Compatibility facade. New code may call person-store directly, but any older
 * call site using people-repository is routed through the same owner-scoped
 * memory/PostgreSQL store instead of the legacy demo array.
 */
export async function listPeople({ ownerUserId, q = "" }: PeopleQuery): Promise<Person[]> {
  const people = await listPeopleStore(ownerUserId);
  const query = q.trim().toLowerCase();
  if (!query) return people;
  return people.filter((person) =>
    [person.name, person.rank, ...person.personality]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export async function findPersonById(ownerUserId: string, personId: string): Promise<Person | undefined> {
  return getPersonStore(personId, ownerUserId);
}
