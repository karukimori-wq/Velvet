import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";
import { getAiUsageStatus } from "@/lib/ai-usage";
import { getStorageStatus } from "@/lib/storage-status";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";
import { getMediaAccess } from "@/lib/media-access";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { getOwnerPreferences } from "@/lib/owner-preferences";
import { setSoonAlertsAction } from "./actions";

export default async function SettingsPage({searchParams}:{searchParams?:Promise<{soonAlerts?:string}>}){
 const query=searchParams?await searchParams:{};const {workspaceId,userId,ownerUserId}=await getRequestIdentity();const [usage,access,media,customers,preferences]=await Promise.all([getAiUsageStatus(ownerUserId),getPlanAccess(ownerUserId),getMediaAccess(ownerUserId),listGrowthCustomers(workspaceId,userId),getOwnerPreferences(ownerUserId)]);const ai=getAiPlatformStatus();const storage=getStorageStatus();const aiReady=ai.configured&&ai.contractReady&&ai.clientConfigured;const imageState=access.attachmentsAllowed?(media.configured?"画像を保存できます":"添付ファイルは準備中です"):"Freeでは添付ファイルは利用できません";const clerkEnabled=process.env.VELVET_AUTH_MODE?.trim().toLowerCase()==="clerk";
 return <main className="shell settingsShell"><AppHeader title="設定"/>
 <section className="settingsIntro"><strong>Velvetを、自分の使い方に。</strong><small>普段の操作に必要な設定だけをまとめています。</small></section>
 <div className="sectionTitle">プラン・保存</div><div className="stack settingsCards"><Link className="card settingsRow" href="/plans"><div><div className="timelineTitle">プラン</div><div className="timelineBody">{access.plan==="business"?"Business":access.plan==="pro"?"Pro":"Free"}</div>{access.plan==="free"&&<div className="formHint">お客様 {customers.length}/30名 · 履歴は直近3か月</div>}</div><span>›</span></Link><section className="card settingsRow"><div><div className="timelineTitle">画像・添付</div><div className="timelineBody">{imageState}</div></div></section><section className="card settingsRow"><div><div className="timelineTitle">データ保存</div><div className="timelineBody">{storage.productionReady?"保存できます":"現在は一時保存です"}</div></div></section></div>
 <div className="sectionTitle">思い出すための表示</div><section className="card stack"><div className="row"><div><div className="timelineTitle">そろそろ</div><div className="timelineBody">来店周期から、いつもより間が空きそうなお客様をホームに表示します。</div><div className="formHint">プッシュ通知やメールは送りません。</div></div><span className="chip">{access.soonAlertsAllowed?(preferences.soonAlertsEnabled?"ON":"OFF"):"Pro"}</span></div>{query?.soonAlerts&&<div className="formHint">そろそろ表示を{query.soonAlerts==="on"?"ON":"OFF"}にしました。</div>}{access.soonAlertsAllowed?<form action={setSoonAlertsAction}><button className="secondaryButton" type="submit" name="enabled" value={preferences.soonAlertsEnabled?"false":"true"}>{preferences.soonAlertsEnabled?"表示をOFFにする":"表示をONにする"}</button></form>:<Link className="secondaryButton actionLink" href="/plans">Proで使う</Link>}</section>
 <div className="sectionTitle">入力</div><div className="stack settingsCards"><Link className="card settingsRow" href="/settings/dictionary"><div><div className="timelineTitle">よく使う言葉</div><div className="timelineBody">「覚える」に出る候補を確認・削除</div></div><span>›</span></Link><Link className="card settingsRow" href="/self-investment"><div><div className="timelineTitle">自分のこと</div><div className="timelineBody">美容・衣装・学びなどを残す</div></div><span>›</span></Link></div>
 <details className="detailsCard"><summary>データの入出力</summary><div className="stack detailsBody"><Link className="card settingsRow" href="/import"><div><div className="timelineTitle">データをまとめて登録</div><div className="timelineBody">Velvetのお客様メモをまとめて取り込みます</div></div><span>›</span></Link>{access.exportAllowed?<Link className="card settingsRow" href="/api/export"><div><div className="timelineTitle">データを書き出す</div><div className="timelineBody">Velvetのお客様メモを書き出します</div></div><span>›</span></Link>:<Link className="card settingsRow" href="/plans"><div><div className="timelineTitle">データを書き出す</div><div className="formHint">Proで利用できます</div></div><span>›</span></Link>}</div></details>
 <details className="detailsCard settingsTechnical"><summary>アプリの状態</summary><div className="stack detailsBody"><section className="card"><div className="timelineTitle">思い出す補助</div><div className="timelineBody">{aiReady?"利用できます":"基本機能で利用できます"}</div><div className="formHint">AIは裏方として、思い出す手間を減らすために使います。</div></section><section className="card"><div className="timelineTitle">今月のAI利用</div><div className="timelineBody">{usage.connected?`${usage.usageCount??0}回`:"利用回数の表示は準備中です"}</div></section></div></details>
 {clerkEnabled&&<><div className="sectionTitle">アカウント</div><SignOutButton redirectUrl="/auth"><button className="secondaryButton" type="button">ログアウト</button></SignOutButton></>}
 <BottomNav/></main>;
}
