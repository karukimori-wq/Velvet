import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listPeopleStore } from "@/lib/person-store";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { createScheduleAction } from "./actions";

const kindLabel = { shift: "出勤", visit: "来店", birthday: "誕生日", unavailable: "NG時間", self_investment: "自己投資", other: "その他" } as const;

export default async function SchedulePage() {
  const { ownerUserId } = await getRequestIdentity();
  const [entries, people] = await Promise.all([listScheduleEntries(ownerUserId), listPeopleStore(ownerUserId)]);

  return (
    <main className="shell">
      <header className="header"><div className="brand">Schedule</div></header>
      <section className="hero"><h1>予定だけ、シンプルに。</h1><p>必要な予定だけ残します。営業指示は出しません。</p></section>
      {entries.length > 0 && <div className="stack">{entries.map((entry) => <article className="card" key={entry.id}><div className="row"><strong>{entry.title}</strong><span className="subtle">{kindLabel[entry.kind]}</span></div>{entry.startsAt && <div className="personMeta">{new Date(entry.startsAt).toLocaleString("ja-JP")}</div>}{entry.note && <div className="timelineBody">{entry.note}</div>}</article>)}</div>}
      {entries.length === 0 && <div className="card empty">予定はまだありません</div>}
      <div className="sectionTitle">予定を追加</div>
      <form action={createScheduleAction} className="stack">
        <input className="searchBox" name="title" placeholder="例：山田さん来店 / 出勤 / ネイル" autoComplete="off" />
        <div className="chips choiceRow">{(["visit", "shift", "birthday", "unavailable", "self_investment", "other"] as const).map((kind) => <label className="choiceChip" key={kind}><input type="radio" name="kind" value={kind} defaultChecked={kind === "visit"} />{kindLabel[kind]}</label>)}</div>
        <select className="selectBox" name="personId" defaultValue=""><option value="">人物なし</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
        <input className="searchBox" name="startsAt" type="datetime-local" />
        <input className="searchBox" name="note" placeholder="メモは必要な時だけ" autoComplete="off" />
        <button className="primaryButton" type="submit">追加</button>
      </form>
      <BottomNav />
    </main>
  );
}
