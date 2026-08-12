import Link from "next/link";
import { ImportForm } from "./import-form";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="shell">
    <header className="header"><Link className="subtle" href="/people">‹ 戻る</Link><span className="subtle">Import</span></header>
    <section className="hero"><h1>VelvetメモをJSONで登録</h1><p>Growth EngineのcustomerIdに、接客メモや好みなどProfessional Memoryだけを紐づけます。Customer名・連絡先・決済情報は登録しません。</p></section>
    {error && <div className="formError">形式を確認してください：{error}</div>}
    <ImportForm />
    <div className="sectionTitle">自分のVelvetメモを書き出す</div>
    <Link className="secondaryButton actionLink" href="/api/export">JSON Export</Link>
  </main>;
}
