import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="メインナビゲーション">
      <Link className="navItem" href="/"><strong>⌂</strong>ホーム</Link>
      <Link className="navItem captureNav" href="/capture"><strong>＋</strong>記録</Link>
      <Link className="navItem" href="/people"><strong>◉</strong>お客様</Link>
      <Link className="navItem" href="/schedule"><strong>□</strong>予定</Link>
    </nav>
  );
}
