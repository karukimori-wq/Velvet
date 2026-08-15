import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listDictionaryEntries } from "@/lib/capture-dictionary-repository";
import { deleteDictionaryEntryAction } from "./actions";

export default async function DictionarySettingsPage(){const {workspaceId,userId}=await getRequestIdentity();const entries=await listDictionaryEntries(workspaceId,userId,200);return <main className="shell"><header className="header"><Link className="subtle" href="/settings">‹ 自分</Link><span className="subtle">入力候補</span></header><section className="hero"><h1>よく使う言葉</h1><p>接客メモで登録した言葉を候補として覚えます。不要になったものだけ削除できます。</p></section>{entries.length===0?<div className="empty">まだ候補はありません。</div>:<div className="stack">{entries.map(entry=><section className="card row" key={entry.id}><div><div className="timelineTitle">{entry.displayValue}</div><div className="formHint">{entry.useCount}回使用 · 最終 {entry.lastUsedAt.slice(0,10)}</div></div><form action={deleteDictionaryEntryAction.bind(null,entry.id)}><button className="secondaryButton compactButton" type="submit">削除</button></form></section>)}</div>}</main>}
