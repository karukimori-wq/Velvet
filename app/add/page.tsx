import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export default function AddPage() {
  return <main className="shell">
    <header className="header"><div className="brand">追加</div></header>
    <section className="hero"><h1>何を残しますか？</h1><p>よく使うものから選べます。</p></section>
    <div className="stack registerHub">
      <Link className="card registerChoice" href="/capture/profile"><div className="registerIcon">人</div><div><strong>お客様を覚える</strong><p>外見・服装・持ち物・好み・仕事など</p></div><span>›</span></Link>
      <Link className="card registerChoice" href="/capture"><div className="registerIcon">話</div><div><strong>今日の接客を残す</strong><p>話したこと・新しく分かったこと・次回の話題</p></div><span>›</span></Link>
    </div>
    <div className="sectionTitle">その他</div>
    <div className="quickRegisterGrid"><Link className="card quickRegister" href="/schedule">予定を追加</Link><Link className="card quickRegister" href="/self-investment">自分の記録</Link></div>
    <BottomNav />
  </main>;
}
