import { DEMO_OWNER_USER_ID } from "@/lib/current-owner";

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  body?: string;
};

export type Person = {
  id: string;
  ownerUserId: string;
  name: string;
  rank?: string;
  lastVisit?: string;
  nextVisit?: string;
  personality: string[];
  timeline: TimelineItem[];
};

const OWNER = DEMO_OWNER_USER_ID;

export const people: Person[] = [
  {
    id: "person_yamada",
    ownerUserId: OWNER,
    name: "山田さん",
    rank: "VIP",
    lastVisit: "2026-08-02",
    nextVisit: "今日 21:00",
    personality: ["会社経営", "既婚", "ゴルフ", "犬", "響", "ロレックス", "黒縁メガネ"],
    timeline: [
      { id: "t1", date: "2026-08-02", title: "指名 · カード · ¥85,000", body: "大阪出張の話。犬を飼った。" },
      { id: "t2", date: "2026-07-18", title: "田中さんのヘルプ", body: "お土産をもらった。" },
      { id: "t3", date: "2026-07-03", title: "指名 · 響" },
    ],
  },
  {
    id: "person_sato",
    ownerUserId: OWNER,
    name: "佐藤さん",
    lastVisit: "2026-07-29",
    personality: ["IT", "未婚", "サウナ", "白州"],
    timeline: [
      { id: "s1", date: "2026-07-29", title: "新規 · 現金 · ¥42,000", body: "サウナと旅行の話。" },
    ],
  },
  {
    id: "person_tanaka",
    ownerUserId: OWNER,
    name: "田中さん",
    rank: "A",
    personality: ["建築", "ゴルフ", "メガネ"],
    timeline: [],
  },
];

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listPeople(ownerUserId = OWNER) {
  return people.filter((person) => person.ownerUserId === ownerUserId);
}

export function getPerson(id: string, ownerUserId = OWNER) {
  return people.find((person) => person.id === id && person.ownerUserId === ownerUserId);
}

export function createPerson(name: string, ownerUserId = OWNER) {
  const person: Person = {
    id: makeId("person"),
    ownerUserId,
    name: name.trim(),
    personality: [],
    timeline: [],
  };
  people.unshift(person);
  return person;
}

export function updatePersonBasics(id: string, values: { name?: string; rank?: string }, ownerUserId = OWNER) {
  const person = getPerson(id, ownerUserId);
  if (!person) return undefined;
  if (values.name?.trim()) person.name = values.name.trim();
  const rank = values.rank?.trim();
  person.rank = rank || undefined;
  return person;
}

export function addPersonKnowledge(id: string, rawValue: string, ownerUserId = OWNER) {
  const person = getPerson(id, ownerUserId);
  if (!person) return undefined;
  const values = rawValue
    .split(/[、,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
  for (const value of values) {
    if (!person.personality.includes(value)) person.personality.push(value);
  }
  return person;
}

export function removePersonKnowledge(id: string, value: string, ownerUserId = OWNER) {
  const person = getPerson(id, ownerUserId);
  if (!person) return undefined;
  person.personality = person.personality.filter((item) => item !== value);
  return person;
}

export function prependTimelineItem(id: string, item: TimelineItem, ownerUserId = OWNER) {
  const person = getPerson(id, ownerUserId);
  if (!person) return undefined;
  if (!person.timeline.some((existing) => existing.id === item.id)) {
    person.timeline.unshift(item);
  }
  return person;
}
