import Link from "next/link";
import { notFound } from "next/navigation";
import { getPerson } from "@/lib/demo-data";
import { addKnowledgeAction, updatePersonAction } from "../../actions";

export default async function EditPersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const person = getPerson(personId);
  if (!person) notFound();

  return (
    <main className="shell">
      <header className="header">
        <Link className="subtle" href={`/people/${person.id}`}>‹ 戻る</Link>
        <span className="subtle">編集</span>
      </header>

      <section className="hero">
        <h1>{person.name}</h1>
        <p>空の項目は並べません。必要な情報だけ追加します。</p>
      </section>

      <form action={updatePersonAction.bind(null, person.id)} className="stack">
        <label className="fieldLabel" htmlFor="name">名前</label>
        <input id="name" name="name" className="searchBox" defaultValue={person.name} autoComplete="off" />
        {person.rank && <label className="fieldLabel" htmlFor="rank">ランク</label>}
        <input id="rank" name="rank" className="searchBox" defaultValue={person.rank ?? ""} placeholder={person.rank ? undefined : "ランクを追加する場合だけ入力"} autoComplete="off" />
        <button className="secondaryButton" type="submit">基本情報を更新</button>
      </form>

      <div className="sectionTitle">パーソナリティ</div>
      {person.personality.length > 0 && (
        <div className="chips">
          {person.personality.map((value) => <span className="chip" key={value}>{value}</span>)}
        </div>
      )}

      <form action={addKnowledgeAction.bind(null, person.id)} className="stack compactForm">
        <label className="fieldLabel" htmlFor="value">記憶を追加</label>
        <input id="value" name="value" className="searchBox" placeholder="例：黒髪、ロレックス、ゴルフ、既婚" autoComplete="off" />
        <div className="formHint">「、」区切りでまとめて追加できます。</div>
        <button className="primaryButton" type="submit">追加</button>
      </form>
    </main>
  );
}
