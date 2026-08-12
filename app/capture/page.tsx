import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPersonStore } from "@/lib/person-store";
import { getCaptureSuggestions } from "@/lib/capture-repository";
import { captureAction, conversationMemoAction, quickCaptureAction } from "./actions";
import { organizeCaptureAction } from "./organize/actions";

function stampCategory(value: string) {
  if (/(髪|メガネ|服|顔|時計|財布|ロレックス|アクセサリー)/.test(value)) return "外見・持ち物";
  if (/(響|白州|酒|ワイン|ビール|ゴルフ|犬|旅行|甘い|趣味|好き)/.test(value)) return "好み・趣味";
  if (/(会社|仕事|経営|社長|職業)/.test(value)) return "仕事";
  if (/(既婚|未婚|家族|子供|友人)/.test(value)) return "人となり";
  return "その他";
}

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ personId?: string; saved?: string; error?: string; fromVisit?: string }> }) {
  const { personId, saved, error, fromVisit } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const [person, suggestions] = await Promise.all([
    personId ? getPersonStore(personId, ownerUserId) : Promise.resolve(undefined),
    getCaptureSuggestions(ownerUserId, personId, 24),
  ]);
  const personSuggestions = suggestions.filter((item) => item.source === "person").slice(0, 8);
  const recentSuggestions = suggestions.filter((item) => item.source === "recent").slice(0, 10);
  const defaultSuggestions = suggestions.filter((item) => item.source === "default");
  const defaultGroups = ["外見・持ち物", "好み・趣味", "仕事", "人となり", "その他"].map((category) => ({
    category,
    items: defaultSuggestions.filter((item) => stampCategory(item.value) === category),
  })).filter((group) => group.items.length > 0);

  const stampGroup = (items: typeof suggestions) => (
    <div className="chips">
      {items.map((item) => (
        <form action={quickCaptureAction.bind(null, personId, "knowledge", item.value, fromVisit)} key={item.value}>
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
        <h1>{fromVisit && person ? `${person.name}の退店後メモ` : person ? `${person.name}を思い出す材料を残す` : "一言でも、すぐ残す。"}</h1>
        <p>{fromVisit ? "覚えているうちに、スタンプと一言だけ。" : "まずタップ。足りない時だけ文字入力。客が帰った直後に短時間で終わることを優先します。"}</p>
      </section>

      {saved && <div className="card successCard">保存しました。続けてタップできます。</div>}
      {error && <div className="formError">入力内容を確認してください。</div>}

      {fromVisit && person && <>
        <div className="sectionTitle">会話メモ · タイムラインに残す</div>
        <form action={conversationMemoAction.bind(null, person.id, fromVisit)} className="stack">
          <input className="searchBox" name="value" placeholder="例：来月大阪出張。娘の受験の話。" autoComplete="off" />
          <div className="formHint">その日の会話として残します。パーソナリティには混ぜません。</div>
          <button className="primaryButton" type="submit">会話メモを保存して終了</button>
        </form>
      </>}

      {personSuggestions.length > 0 && <>
        <div className="sectionTitle">この人で使いそう</div>
        {stampGroup(personSuggestions)}
      </>}

      {recentSuggestions.length > 0 && <>
        <div className="sectionTitle">最近よく使う</div>
        {stampGroup(recentSuggestions)}
      </>}

      {defaultGroups.length > 0 && <div className="sectionTitle">スタンプ</div>}
      {defaultGroups.map((group) => <div key={group.category}>
        <div className="formHint" style={{ marginTop: 10 }}>{group.category}</div>
        {stampGroup(group.items)}
      </div>)}

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
