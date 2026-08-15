import Link from "next/link";

export function BottomNav(){return <nav className="bottomNav" aria-label="メインメニュー"><Link className="navItem" href="/"><strong>⌂</strong>ホーム</Link><Link className="navItem" href="/people"><strong>◉</strong>お客様</Link><Link className="navItem captureNav" href="/add"><strong>＋</strong>追加</Link><Link className="navItem" href="/schedule"><strong>□</strong>予定</Link><Link className="navItem" href="/settings"><strong>◇</strong>自分</Link></nav>}
