import Link from "next/link";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";
import { getAiUsageStatus } from "@/lib/ai-usage";
import { getStorageStatus } from "@/lib/storage-status";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export default async function SettingsPage() {
  const ai = getAiPlatformStatus();
  const usage = await getAiUsageStatus(getCurrentOwnerUserId());
  const storage = getStorageStatus();
  const aiReady = ai.configured && ai.contractReady && ai.clientConfigured;

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">Settings</div>
        <Link className="subtle" href="/">閉じる</Link>
      </header>

      <div className="sectionTitle">状態</div>
      <div className="stack">
        <section className="card">
          <div className="timelineTitle">データ保存</div>
          <div className="timelineBody">{storage.productionReady ? "永続化されています" : "開発用の一時保存です"}</div>
        </section>
        <section className="card">
          <div className="timelineTitle">整理・文章検索</div>
          <div className="timelineBody">{aiReady ? "AI Platform Core Gateway 接続可能" : "ローカルfallbackで利用可能"}</div>
          <div className="formHint">AI Platform Coreの `/v1/gateway/run` を利用します。未接続でも基本操作は止まりません。</div>
        </section>
        <section className="card">
          <div className="timelineTitle">今月のAI利用</div>
          <div className="timelineBody">{usage.connected ? `${usage.usageCount ?? 0}回 · ${usage.totalTokens ?? 0} tokens` : "利用量連携はまだ有効ではありません"}</div>
          <div className="formHint">利用量の正本はAI Platform Coreです。</div>
        </section>
        <section className="card">
          <div className="timelineTitle">AIポイント</div>
          <div className="timelineBody">ポイント残高機能は未接続です</div>
          <div className="formHint">Free/Proのポイント購入・残高は別の課金契約として実装します。Velvet側で仮残高は作りません。</div>
        </section>
      </div>

      <div className="sectionTitle">データ</div>
      <div className="stack">
        <Link className="card" href="/import"><div className="timelineTitle">JSON Import</div><div className="timelineBody">既存の顧客情報をまとめて登録</div></Link>
        <Link className="card" href="/api/export"><div className="timelineTitle">JSON Export</div><div className="timelineBody">自分のデータを書き出す</div></Link>
      </div>
    </main>
  );
}
