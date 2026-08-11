import Link from "next/link";
import { getAiPlatformStatus } from "@/lib/ai-platform-core";
import { getAiUsageStatus } from "@/lib/ai-usage";
import { getStorageStatus } from "@/lib/storage-status";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export default async function SettingsPage() {
  const ai = getAiPlatformStatus();
  const usage = await getAiUsageStatus(getCurrentOwnerUserId());
  const storage = getStorageStatus();
  const aiReady = ai.configured && ai.contractReady && ai.capturePathConfigured && ai.searchPathConfigured;

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
          <div className="timelineBody">{aiReady ? "AI Platform Core 接続可能" : "ローカルfallbackで利用可能"}</div>
          <div className="formHint">共有契約は承認済み。接続先と同期operation pathが設定されると外部AIを使用します。</div>
        </section>
        <section className="card">
          <div className="timelineTitle">AIポイント</div>
          <div className="timelineBody">{usage.connected && typeof usage.balance === "number" ? `${usage.balance} points` : "残高連携はまだ有効ではありません"}</div>
          <div className="formHint">AI利用量の正本はAI Platform Coreです。Velvet側で仮の残高は作りません。</div>
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
