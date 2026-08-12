import Link from "next/link";
import { createRelationshipAction } from "../actions";

const labels = { friend: "友人", coworker: "同僚", boss: "上司", subordinate: "部下", family: "家族", partner: "パートナー", referral: "紹介", business: "取引先", other: "その他" } as const;

export default async function NewRelationshipPage({ searchParams }: { searchParams: Promise<{ customerId?: string }> }) {
  const { customerId = "" } = await searchParams;
  return <main className="shell">
    <header className="header"><Link className="subtle" href={customerId ? `/people/${customerId}` : "/people"}>‹ 戻る</Link><span className="subtle">関係性</span></header>
    <section className="hero"><h1>必要な関係だけ。</h1><p>Growth EngineのcustomerId同士を参照して、Velvetには関係メモだけを保存します。</p></section>
    <form action={createRelationshipAction} className="stack">
      <input className="searchBox" name="customerAId" defaultValue={customerId} placeholder="customerId" autoComplete="off" />
      <input className="searchBox" name="customerBId" placeholder="相手のcustomerId" autoComplete="off" />
      <div className="chips choiceRow">{Object.entries(labels).map(([value, label]) => <label className="choiceChip" key={value}><input type="radio" name="type" value={value} defaultChecked={value === "friend"} />{label}</label>)}</div>
      <input className="searchBox" name="note" placeholder="補足は必要な時だけ" autoComplete="off" />
      <button className="primaryButton" type="submit">追加</button>
    </form>
  </main>;
}
