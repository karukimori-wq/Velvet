import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPersonStore } from "@/lib/person-store";
import { getCaptureSuggestions } from "@/lib/capture-repository";
import { captureAction, quickCaptureAction } from "./actions";
import { organizeCaptureAction } from "./organize/actions";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ personId?: string; saved?: string; error?: string }> }) {
  const { personId, saved, error } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const [person, suggestions] = await Promise.all([
    personId ? getPersonStore(personId, ownerUserId) : Promise.resolve(undefined),
    getCaptureSuggestions(ownerUserId, personId, 18),
  ]);
  const personSuggestions = suggestions.filter((item) => item.source === "person").slice(0, 8);
  const recentSuggestions = suggestions.filter((item) => item.source === "recent").slice(0, 10);
  const defaultSuggestions = suggestions.filter((item) => item.source === "default").slice(0, 10);

  const stampGroup = (items: typeof suggestions) => (
    <div className="chips">
      {items.map((item) => (
        <form action={quickCaptureAction.bind(null, personId, "knowledge", item.value)} key={item.value}>
          <button className="chip chipButton" type="submit">{item.value}</button>
        </form>
      ))}
    </div>
  );

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">Capture</div>
        {person && <Link className="subtle" href={`/people/${person.id}`}>{person.name}</Link>}
      </header>

      <section className="hero">
        <h1>{person ? `${person.name}を思い出す材料を残す` : "一言でも、すぐ残す。"}</h1>
        <p>まずタップ。足りない時だけ文字入力。客が帰った直後に短時間で終わることを優先します。</p>
      </section>

      {saved && <div className="card successCard">保存しました。続けてタップできます。</div>}
      {error && <div className="formError">入力内容を確認してください。</div>}

      {personSuggestions.length > 0 && <>
        <div className="sectionTitle">この人で使いそう</div>
        {stampGroup(personSuggestions)}
      </>}

      {recentSuggestions.length > 0 && <>
        <div className="sectionTitle">最近よく使う</div>
        {stampGroup(recentSuggestions)}
      </>}

      {defaultSuggestions.length > 0 && <>
        <div className="sectionTitle">スタンプ</div>
        {stampGroup(defaultSuggestions)}
      </>}

      <div className="sectionTitle">一言でまとめる</div>
      <form action={organizeCaptureAction.bind(null, personId)} className="stack">
        <input className="searchBox" name="value" placeholder="例：黒髪、ロレックス、来月大阪、犬飼った" autoComplete="off" />
        <div className="formHint">元メモを先に保存。曖昧な内容だけ整理候補にして、確認後に反映します。</div>
        <button className="primaryButton" type="submit">保存して整理</button>
      </form>

      <details className="detailsCard">
        <summary>確実な内容を直接追加</summary>
        <form action={captureAction.bind(null, personId, "knowledge")} className="stack detailsBody">
          <input className="searchBox" name="value" placeholder="例：黒髪、ロレックス、ゴルフ" autoComplete="off" />
          <div className="formHint">「、」区切りでまとめて追加できます。</div>
          <button className="secondaryButton" type="submit">パーソナリティへ追加</button>
        </form>
      </details>

      <details className="detailsCard">
        <summary>自由メモだけ残す</summary>
        <form action={captureAction.bind(null, personId, "free_text")} className="stack detailsBody">
          <input className="searchBox" name="value" placeholder="あとで整理したい内容" autoComplete="off" />
          <button className="secondaryButton" type="submit">そのまま保存</button>
        </form>
      </details>

      <BottomNav />
    </main>
  );
}
