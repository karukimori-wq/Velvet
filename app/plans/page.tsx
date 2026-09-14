import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";

const proFeatures = [
  ["覚える人数", "上限なし"],
  ["履歴", "無期限・一括タイムライン"],
  ["思い出す", "全履歴・フォロー・そろそろをまとめて確認"],
  ["入力", "音声入力＋整理"],
  ["探す", "会話・贈り物・履歴まで詳しく検索"],
  ["忘れない", "次回アクション・期限付きフォロー"],
  ["連絡", "LINE / DM / メール文案"],
  ["保存", "画像・JSON Export"],
] as const;

export default async function PlansPage(){const {workspaceId,userId,ownerUserId}=await getRequestIdentity();const [access,customers]=await Promise.all([getPlanAccess(ownerUserId),listGrowthCustomers(workspaceId,userId)]);const current=access.plan==="business"?"Business":access.plan==="pro"?"Pro":"Free";const cutoff=access.historyCutoff?.toISOString().slice(0,10);return <main className="shell"><header className="header"><div className="brand">プラン</div><Link className="subtle" href="/settings">閉じる</Link></header><section className="card noticeCard"><div className="formHint">現在のプラン</div><div className="timelineTitle">{current}</div>{access.plan==="free"?<><div className="timelineBody">お客様 {customers.length}/30名</div><div className="formHint">履歴対象：{cutoff?`${cutoff}以降（直近3か月）`:"直近3か月"}</div></>:<div className="timelineBody">お客様人数・履歴期間とも上限なし</div>}</section>
<section className="hero"><h1>人との関係を忘れない</h1><p>Proは月990円。AIを売るのではなく、覚える・探す・忘れないを楽にします。</p></section><div className="stack"><section className={`card ${access.plan==="free"?"successCard":""}`}><div className="row"><div><div className="timelineTitle">Free</div><div className="timelineBody">30名までのお客様と、直近3か月の記録を管理できます。</div></div>{access.plan==="free"&&<span className="chip">利用中</span>}</div><div className="formHint">文字入力・スタンプ入力・基本検索で、日付とイベント名から記録を一件ずつ確認します。</div></section><section className={`card ${access.plan==="pro"?"successCard":""}`}><div className="row"><div><div className="timelineTitle">Pro · 990円/月</div><div className="timelineBody">お客様との会話や出来事を無期限で残し、次に会う前にすぐ思い出せます。</div></div>{access.plan==="pro"&&<span className="chip">利用中</span>}</div><div className="memoryValueList">{proFeatures.map(([label,value])=><div className="memoryValueRow" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>{access.plan==="free"&&<button className="primaryButton" type="button" disabled>Proへのアップグレードは準備中</button>}</section><section className="card"><div className="row"><div><div className="timelineTitle">Business</div><div className="timelineBody">Growth Engineなど他アプリとの事業連携</div></div><span className="chip">準備中</span></div><div className="formHint">今回は購入できません。売上・予約・支払いを使う本格分析はFree / Proリリース後に提供予定です。</div></section></div><div className="sectionTitle">契約・請求</div><section className="card"><div className="timelineBody">現在の契約状態：{access.plan==="free"?"Free":"利用中"}</div><div className="formHint">支払いと契約状態の正本はGrowth Engine側に置き、Velvetは利用権限だけを参照します。</div></section><BottomNav/></main>}
