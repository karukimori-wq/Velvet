import { people, type Person } from "./demo-data";

export type PeopleQuery = {
  ownerUserId: string;
  q?: string;
};

const DEMO_OWNER = "user_demo_owner";

export async function listPeople({ ownerUserId, q = "" }: PeopleQuery): Promise<Person[]> {
  if (ownerUserId !== DEMO_OWNER) return [];
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
  if (ownerUserId !== DEMO_OWNER) return undefined;
  return people.find((person) => person.id === personId);
}
