import Link from "next/link";
import { createPersonAction } from "../actions";

export default async function NewPersonPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="shell">
      <header className="header">
        <Link className="subtle" href="/people">‹ People</Link>
        <span className="subtle">新規登録</span>
      </header>

      <section className="hero">
        <h1>名前だけで登録</h1>
        <p>分かることは、あとから少しずつ追加できます。</p>
      </section>

      <form action={createPersonAction} className="stack">
        <label className="fieldLabel" htmlFor="name">名前</label>
        <input id="name" name="name" className="searchBox" placeholder="山田さん" autoFocus autoComplete="off" />
        {error === "name" && <div className="formError">名前を入力してください</div>}
        <button className="primaryButton" type="submit">登録</button>
      </form>
    </main>
  );
}
