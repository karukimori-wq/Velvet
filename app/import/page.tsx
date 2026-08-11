import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listPeopleStore } from "@/lib/person-store";
import { ImportForm } from "./import-form";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { ownerUserId } = await getRequestIdentity();
  const people = await listPeopleStore(ownerUserId, { includeArchived: true });

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href="/people">‹ 戻る</Link><span className="subtle">Import</span></header>
      <section className="hero"><h1>JSONでまとめて登録</h1><p>Excelや既存メモを外部AIでJSONへ変換して、ここで確認してから登録します。</p></section>
      {error && <div className="formError">形式を確認してください：{error}</div>}
      <ImportForm existingNames={people.map((person) => person.name)} />
      <div className="sectionTitle">自分のデータを書き出す</div>
      <Link className="secondaryButton actionLink" href="/api/export">JSON Export</Link>
    </main>
  );
}
