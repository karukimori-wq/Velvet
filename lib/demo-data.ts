export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  body?: string;
};

export type Person = {
  id: string;
  name: string;
  rank?: string;
  lastVisit?: string;
  nextVisit?: string;
  personality: string[];
  timeline: TimelineItem[];
};

export const people: Person[] = [
  {
    id: "person_yamada",
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
    name: "佐藤さん",
    lastVisit: "2026-07-29",
    personality: ["IT", "未婚", "サウナ", "白州"],
    timeline: [
      { id: "s1", date: "2026-07-29", title: "新規 · 現金 · ¥42,000", body: "サウナと旅行の話。" },
    ],
  },
  {
    id: "person_tanaka",
    name: "田中さん",
    rank: "A",
    personality: ["建築", "ゴルフ", "メガネ"],
    timeline: [],
  },
];

export function getPerson(id: string) {
  return people.find((person) => person.id === id);
}
