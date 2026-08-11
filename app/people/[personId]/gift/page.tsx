import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { getPersonStore } from "@/lib/person-store";
import { createGiftAction } from "./actions";

export default async function GiftPage({ params, searchParams }: { params: Promise<{ personId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { personId } = await params;
  const { error } = await searchParams;
  const ownerUserId = getCurrentOwnerUserId();
  const person = await getPersonStore(personId, ownerUserId);
  if (!person) notFound();

  const commonItems = ["お土産", "花", "財布", "時計", "ボトル", "アクセサリー"];

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href={`/people/${person.id}`}>‹ 戻る</Link><span className="subtle">Gift</span></header>
      <section className="hero"><h1>{person.name}</h1><p>もらった・あげたを最短で記録します。</p></section>
      {error && <div className="formError">品物を入力してください。</div>}
      <div className="sectionTitle">もらった</div>
      <form action={createGiftAction.bind(null, person.id, "received")} className="stack">
        <div className="chips">{commonItems.map((item) => <button className="chip chipButton" type="submit" name="item" value={item} key={`r-${item}`}>{item}</button>)}</div>
        <input className="searchBox" name="item" placeholder="その他：品物を入力" autoComplete="off" />
        <button className="primaryButton" type="submit">もらった物を保存</button>
      </form>
      <div className="sectionTitle">あげた</div>
      <form action={createGiftAction.bind(null, person.id, "given")} className="stack">
        <div className="chips">{commonItems.map((item) => <button className="chip chipButton" type="submit" name="item" value={item} key={`g-${item}`}>{item}</button>)}</div>
        <input className="searchBox" name="item" placeholder="その他：品物を入力" autoComplete="off" />
        <button className="secondaryButton" type="submit">あげた物を保存</button>
      </form>
      <details className="detailsCard"><summary>金額・理由・メモも追加</summary><div className="stack detailsBody"><div className="formHint">詳細はクイック保存後、必要な場合だけ追記する設計です。MVPではまず最短記録を優先します。</div></div></details>
    </main>
  );
}
