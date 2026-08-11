import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPersonStore, listPeopleStore } from "@/lib/person-store";
import { captureAction, quickCaptureAction } from "./actions";
import { organizeCaptureAction } from "./organize/actions";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ personId?: string; saved?: string; error?: string }> }) {
  const { personId, saved, error } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const [person, people] = await Promise.all([
    personId ? getPersonStore(personId, ownerUserId) : Promise.resolve(undefined),
    listPeopleStore(ownerUserId),
  ]);
  const learned = Array.from(new Set(people.flatMap((item) => item.personality))).slice(0, 10);

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">Capture</div>
        {person && <Link className="subtle" href={`/people/${person.id}`}>{person.name}</Link>}
      </header>
      <section className="hero">
        <h1>{person ? `${person.name}の記憶を追加` : "一言でも、すぐ残す。"}</h1>
        <p>明確なものは1タップ。まとまったメモは、保存してから必要な部分だけ整理できます。</p>
      </section>
      {saved && <div className="card successCard">保存しました</div>}
      {error && <div className="formError">入力内容を確認してください。</div>}
      <div className="sectionTitle">クイック</div>
      <div className="chips">
        {["メガネ", "既婚", "未婚", "ロレックス", "ゴルフ", "犬", "響", "白州"].map((value) => (
          <form action={quickCaptureAction.bind(null, personId, "knowledge", value)} key={value}>
            <button className="chip chipButton" type="submit">{value}</button>
          </form>
        ))}
      </div>
      {learned.length > 0 && <><div className="sectionTitle">よく使う候補</div><div className="chips">{learned.map((value) => (
        <form action={quickCaptureAction.bind(null, personId, "knowledge", value)} key={value}><button className="chip chipButton" type="submit">{value}</button></form>
      ))}</div></>}
      <div className="sectionTitle">まとめて整理</div>
      <form action={organizeCaptureAction.bind(null, personId)} className="stack">
        <input className="searchBox" name="value" placeholder="例：黒髪、ロレックス、来月大阪、既婚" autoComplete="off" />
        <div className="formHint">元メモを先に保存し、候補を確認してから反映します。</div>
        <button className="primaryButton" type="submit">保存して整理</button>
      </form>
      <div className="sectionTitle">そのまま記憶</div>
      <form action={captureAction.bind(null, personId, "knowledge")} className="stack">
        <input className="searchBox" name="value" placeholder="確実な内容をそのまま追加" autoComplete="off" />
        <div className="formHint">「、」区切りで複数追加できます。</div>
        <button className="secondaryButton" type="submit">パーソナリティへ追加</button>
      </form>
      <div className="sectionTitle">自由メモ</div>
      <form action={captureAction.bind(null, personId, "free_text")} className="stack">
        <input className="searchBox" name="value" placeholder="あとで整理したい内容をそのまま残す" autoComplete="off" />
        <button className="secondaryButton" type="submit">そのまま保存</button>
      </form>
      <BottomNav />
    </main>
  );
}
