import Link from "next/link";

export default function NewPersonPage() {
  return (
    <main className="shell">
      <header className="header">
        <Link className="subtle" href="/people">‹ People</Link>
        <span className="subtle">Customer参照</span>
      </header>

      <section className="hero">
        <h1>顧客はGrowth Engineで管理します</h1>
        <p>VelvetではCustomer masterを新規作成しません。Growth Engineから顧客を開くと、そのcustomerIdにVelvetの接客メモや専門タイムラインを紐づけます。</p>
      </section>

      <div className="card">
        <div className="timelineTitle">Velvetで追加できるもの</div>
        <div className="timelineBody">好み・注意点・会話メモ・前回対応・次回話題・接客タイムライン</div>
      </div>

      <Link className="primaryButton actionLink" href="/people">Peopleへ戻る</Link>
    </main>
  );
}
