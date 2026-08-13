import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listSelfInvestments } from "@/lib/self-investment-repository";
import { createSelfInvestmentAction } from "./actions";

const categoryLabels = {
  beauty: "美容",
  fashion: "ファッション",
  photo_content: "撮影・コンテンツ",
  learning: "学び",
  maintenance: "メンテナンス",
  other: "その他",
} as const;

export default async function SelfInvestmentPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const entries = await listSelfInvestments(ownerUserId);

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href="/">‹ ホーム</Link><span className="subtle">自分の記録</span></header>
      <section className="hero"><h1>自分に使ったお金を残す</h1><p>美容、衣装、撮影、学びなど。必要な時だけ簡単に記録できます。</p></section>
      {saved && <div className="card successCard">保存しました</div>}
      {error && <div className="formError">金額を確認してください。</div>}

      <form action={createSelfInvestmentAction} className="stack">
        <div className="chips choiceRow">
          {Object.entries(categoryLabels).map(([value, label]) => <label className="choiceChip" key={value}><input type="radio" name="category" value={value} defaultChecked={value === "beauty"} />{label}</label>)}
        </div>
        <input className="searchBox" name="amount" inputMode="numeric" placeholder="金額" />
        <input className="searchBox" name="occurredAt" type="date" />
        <input className="searchBox" name="memo" placeholder="メモ（必要な時だけ）" autoComplete="off" />
        <button className="primaryButton" type="submit">保存する</button>
      </form>

      <div className="sectionTitle">最近の記録</div>
      <div className="stack">
        {entries.map((entry) => <article className="card" key={entry.id}><div className="row"><strong>{categoryLabels[entry.category]}</strong><span>¥{entry.amount.toLocaleString("ja-JP")}</span></div><div className="personMeta">{entry.occurredAt.slice(0, 10)}</div>{entry.memo && <div className="timelineBody">{entry.memo}</div>}</article>)}
        {entries.length === 0 && <div className="card empty">まだ記録はありません</div>}
      </div>
      <BottomNav />
    </main>
  );
}
