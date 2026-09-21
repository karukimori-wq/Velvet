import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess,hasVelvetFeature } from "@/lib/plan-access";
import { ImportForm } from "./import-form";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const access = await getPlanAccess(ownerUserId);
  const exportAllowed = hasVelvetFeature(access,"export.data");
  return <main className="shell">
    <AppHeader title="データ" />
    <section className="hero"><h1>VelvetメモをJSONで登録</h1><p>Growth EngineのcustomerIdに、接客メモや好みなどProfessional Memoryだけを紐づけます。Customer名・連絡先・決済情報は登録しません。</p></section>
    {error && <div className="formError">形式を確認してください：{error}</div>}
    <ImportForm />
    <div className="sectionTitle">自分のVelvetメモを書き出す</div>
    {exportAllowed
      ? <Link className="secondaryButton actionLink" href="/api/export">JSONを書き出す</Link>
      : <Link className="card actionLink" href="/plans"><div><div className="timelineTitle">JSON書き出し</div><div className="formHint">Proで利用できます</div></div><span>›</span></Link>}
    <BottomNav />
  </main>;
}
