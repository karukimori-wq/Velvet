import Link from "next/link";
import { listPeople } from "@/lib/demo-data";
import { createRelationshipAction } from "../actions";

const labels = {
  friend: "友人",
  coworker: "同僚",
  boss: "上司",
  subordinate: "部下",
  family: "家族",
  partner: "パートナー",
  referral: "紹介",
  business: "取引先",
  other: "その他",
} as const;

export default async function NewRelationshipPage({ searchParams }: { searchParams: Promise<{ personId?: string }> }) {
  const { personId = "" } = await searchParams;
  const people = listPeople();

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href={personId ? `/people/${personId}` : "/people"}>‹ 戻る</Link><span className="subtle">関係性</span></header>
      <section className="hero"><h1>必要な関係だけ。</h1><p>相関図を埋める必要はありません。分かっている関係だけ追加します。</p></section>
      <form action={createRelationshipAction} className="stack">
        <select className="selectBox" name="personAId" defaultValue={personId}>
          <option value="">人物を選択</option>
          {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select>
        <select className="selectBox" name="personBId" defaultValue="">
          <option value="">相手を選択</option>
          {people.filter((person) => person.id !== personId).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select>
        <div className="chips choiceRow">
          {Object.entries(labels).map(([value, label]) => <label className="choiceChip" key={value}><input type="radio" name="type" value={value} defaultChecked={value === "friend"} />{label}</label>)}
        </div>
        <input className="searchBox" name="note" placeholder="補足は必要な時だけ" autoComplete="off" />
        <button className="primaryButton" type="submit">追加</button>
      </form>
    </main>
  );
}
