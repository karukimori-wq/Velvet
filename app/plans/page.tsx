import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";

const proHighlights = [
  ["思い出す", "前回・注意・次の話題・期限付きフォローを、会う前にひとまとめで確認"],
  ["そろそろ", "来店履歴からその人の周期を見て、いつもより間が空いてきたら表示"],
  ["詳しく探す", "文章からキーワードを取り出し、会話・贈り物・全履歴まで横断検索"],
] as const;

const proFeatures = [
  ["覚える人数", "上限なし"],
  ["履歴", "無期限・一括タイムライン"],
  ["思い出す", "全履歴・フォロー・そろそろをまとめて確認"],
  ["入力", "音声入力＋高度整理"],
  ["探す", "会話・贈り物・全履歴まで検索"],
  ["忘れない", "次回アクション・期限付きフォロー"],
  ["連絡", "LINE / DM / メール文案"],
  ["保存", "画像・JSON Export"],
] as const;

export default async function PlansPage() {
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [access, customers] = await Promise.all([getPlanAccess(ownerUserId), listGrowthCustomers(workspaceId, userId)]);
  const current = access.plan === "business" ? "Business" : access.plan === "pro" ? "Pro" : "Free";
  const cutoff = access.historyCutoff?.toISOString().slice(0, 10);

  return <main className="shell plansShell">
    <AppHeader title="プラン" />
    <section className="card noticeCard planCurrentCard">
      <div className="formHint">現在のプラン</div><div className="timelineTitle">{current}</div>
      {access.plan === "free"
        ? <><div className="timelineBody">お客様 {customers.length}/30名</div><div className="formHint">履歴対象：{cutoff ? `${cutoff}以降（直近3か月）` : "直近3か月"}</div></>
        : <div className="timelineBody">お客様人数・履歴期間とも上限なし</div>}
    </section>

    <section className="hero planHero">
      <h1>次に会うとき、ちゃんと思い出せる。</h1>
      <p>Proは月990円。記録を増やすためではなく、必要なときに思い出し、探し、忘れないためのプランです。</p>
    </section>

    <div className="sectionTitle">Proで変わること</div>
    <div className="stack planHighlights">
      {proHighlights.map(([title, body]) => <section className="card" key={title}><div className="timelineTitle">{title}</div><div className="timelineBody">{body}</div></section>)}
    </div>

    <div className="sectionTitle">プラン比較</div>
    <div className="stack">
      <section className={`card ${access.plan === "free" ? "successCard" : ""}`}>
        <div className="row"><div><div className="timelineTitle">Free</div><div className="timelineBody">まず30名まで。直近3か月をシンプルに記録。</div></div>{access.plan === "free" && <span className="chip">利用中</span>}</div>
        <div className="formHint">文字・スタンプ入力、名前・特徴・趣味・タグの基本検索、記録の個別確認が使えます。</div>
      </section>
      <section className={`card ${access.plan === "pro" ? "successCard" : ""}`}>
        <div className="row"><div><div className="timelineTitle">Pro · 990円/月</div><div className="timelineBody">人数も履歴も上限なし。関係を続けるための機能をまとめて使えます。</div></div>{access.plan === "pro" && <span className="chip">利用中</span>}</div>
        <div className="memoryValueList">{proFeatures.map(([label, value]) => <div className="memoryValueRow" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <div className="formHint">文章からの検索キーワード抽出はAIを使わずVelvet内で処理します。音声メモの高度整理や連絡文案など、生成・整理が必要な機能だけAIを利用します。</div>
        {access.plan === "free" && <button className="primaryButton" type="button" disabled>Proへのアップグレードは準備中</button>}
      </section>
      <section className="card">
        <div className="row"><div><div className="timelineTitle">Business</div><div className="timelineBody">Growth Engineなど他アプリとの事業連携</div></div><span className="chip">準備中</span></div>
        <div className="formHint">今回は購入できません。売上・予約・支払いを使う本格分析はFree / Proリリース後に提供予定です。</div>
      </section>
    </div>

    <div className="sectionTitle">契約・請求</div>
    <section className="card"><div className="timelineBody">現在の契約状態：{access.plan === "free" ? "Free" : "利用中"}</div><div className="formHint">支払いと契約状態の正本はGrowth Engine側に置き、Velvetは利用権限だけを参照します。</div></section>
    <BottomNav />
  </main>;
}
