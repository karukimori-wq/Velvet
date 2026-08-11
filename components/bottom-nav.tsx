import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="メインナビゲーション">
      <Link className="navItem" href="/"><strong>⌂</strong>Home</Link>
      <Link className="navItem" href="/people"><strong>⌕</strong>Search</Link>
      <Link className="navItem captureNav" href="/capture"><strong>＋</strong>Capture</Link>
      <Link className="navItem" href="/people"><strong>◉</strong>People</Link>
      <Link className="navItem" href="/schedule"><strong>□</strong>Schedule</Link>
    </nav>
  );
}
