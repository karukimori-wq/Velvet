import { BottomNav } from "@/components/bottom-nav";

export default function CapturePage() {
  return (
    <main className="shell">
      <header className="header"><div className="brand">Capture</div></header>
      <section className="hero"><h1>一言でも、音声でも。</h1><p>どこに保存するかは考えなくて大丈夫。</p></section>
      <div className="card">
        <div className="chips"><span className="chip">🍾 ボトル</span><span className="chip">🎁 Gift</span><span className="chip">👔 仕事</span><span className="chip">⛳ 趣味</span></div>
        <div style={{ height: 12 }} />
        <input className="searchBox" placeholder="例：黒縁メガネ、ロレックス、来月大阪" />
      </div>
      <BottomNav />
    </main>
  );
}
