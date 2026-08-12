import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listDictionaryEntries } from "@/lib/capture-dictionary-repository";
import { deleteDictionaryEntryAction } from "./actions";

export default async function DictionarySettingsPage() {
  const { workspaceId, userId } = await getRequestIdentity();
  const entries = await listDictionaryEntries(workspaceId, userId, 200);

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/settings">‹ Settings</Link><span className="subtle">Capture辞書</span></header>
    <section className="hero"><h1>よく使う言葉</h1><p>Captureで確定した言葉を自動で覚えます。不要な候補だけここから削除できます。</p></section>
    {entries.length === 0 ? <div className="empty">まだ学習した言葉はありません。</div> : <div className="stack">{entries.map((entry) => (
      <section className="card row" key={entry.id}>
        <div><div className="timelineTitle">{entry.displayValue}</div><div className="formHint">使用 {entry.useCount}回 · 最終 {entry.lastUsedAt.slice(0, 10)}</div></div>
        <form action={deleteDictionaryEntryAction.bind(null, entry.id)}><button className="secondaryButton compactButton" type="submit">削除</button></form>
      </section>
    ))}</div>}
  </main>;
}
