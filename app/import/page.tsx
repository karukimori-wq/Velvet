import Link from "next/link";
import { importJsonAction } from "./actions";

const example = `{
  "version": "1.0",
  "people": [
    {
      "name": "山田さん",
      "rank": "VIP",
      "personality": ["会社経営", "既婚", "ゴルフ", "ロレックス"]
    }
  ]
}`;

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href="/people">‹ 戻る</Link><span className="subtle">Import</span></header>
      <section className="hero"><h1>JSONでまとめて登録</h1><p>Excelや既存メモを外部AIでこの形式へ変換して、ここに貼り付けます。</p></section>
      {error && <div className="formError">形式を確認してください：{error}</div>}
      <form action={importJsonAction} className="stack">
        <textarea className="searchBox importArea" name="json" defaultValue={example} />
        <button className="primaryButton" type="submit">内容を確認して登録</button>
      </form>
      <div className="sectionTitle">自分のデータを書き出す</div>
      <Link className="secondaryButton actionLink" href="/api/export">JSON Export</Link>
    </main>
  );
}
