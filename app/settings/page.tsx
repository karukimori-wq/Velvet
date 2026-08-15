import Link from "next/link";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";
import { getAiUsageStatus } from "@/lib/ai-usage";
import { getStorageStatus } from "@/lib/storage-status";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";
import { getMediaAccess } from "@/lib/media-access";

export default async function SettingsPage(){
 const {ownerUserId}=await getRequestIdentity();const [usage,access,media]=await Promise.all([getAiUsageStatus(ownerUserId),getPlanAccess(ownerUserId),getMediaAccess(ownerUserId)]);const ai=getAiPlatformStatus();const storage=getStorageStatus();const aiReady=ai.configured&&ai.contractReady&&ai.clientConfigured;const imageState=access.plan==="free"?"このプランでは画像保存は使いません":media.configured?"画像を保存できます":"画像保存は準備中です";
 return <main className="shell"><header className="header"><div className="brand">自分</div><Link className="subtle" href="/">閉じる</Link></header>
 <div className="sectionTitle">利用状況</div><div className="stack"><section className="card"><div className="timelineTitle">プラン</div><div className="timelineBody">{access.plan==="pro"?"Pro":"Free"}</div></section><section className="card"><div className="timelineTitle">画像</div><div className="timelineBody">{imageState}</div></section><section className="card"><div className="timelineTitle">データ保存</div><div className="timelineBody">{storage.productionReady?"保存できます":"現在は一時保存です"}</div></section><section className="card"><div className="timelineTitle">メモ整理・文章検索</div><div className="timelineBody">{aiReady?"利用できます":"基本機能で利用できます"}</div><div className="formHint">接続状況にかかわらず、基本的な記録や検索は使えます。</div></section><section className="card"><div className="timelineTitle">今月のAI利用</div><div className="timelineBody">{usage.connected?`${usage.usageCount??0}回`:"利用回数の表示は準備中です"}</div></section></div>
 <div className="sectionTitle">入力を使いやすくする</div><div className="stack"><Link className="card" href="/settings/dictionary"><div className="timelineTitle">よく使う言葉</div><div className="timelineBody">候補に出る言葉を確認・削除</div></Link></div>
 <div className="sectionTitle">自分の記録</div><div className="stack"><Link className="card" href="/self-investment"><div className="timelineTitle">自己投資</div><div className="timelineBody">美容・衣装・学びなどを記録</div></Link></div>
 <details className="detailsCard"><summary>データの入出力</summary><div className="stack detailsBody"><Link className="card" href="/import"><div className="timelineTitle">データをまとめて登録</div><div className="timelineBody">Velvetのお客様メモをまとめて取り込みます</div></Link><Link className="card" href="/api/export"><div className="timelineTitle">データを書き出す</div><div className="timelineBody">Velvetのお客様メモを書き出します</div></Link></div></details>
 </main>;
}
