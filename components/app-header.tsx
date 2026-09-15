"use client";

import Link from "next/link";
import { useState } from "react";

const menuItems = [
  ["⌂", "ホーム", "/"],
  ["♙", "顧客管理", "/people"],
  ["▣", "予定・イベント", "/schedule"],
  ["▤", "記録", "/capture"],
  ["⌕", "詳しく探す", "/search?q="],
] as const;

export function AppHeader({ title = "Velvet", rightHref, rightLabel }: { title?: string; rightHref?: string; rightLabel?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <header className="velvetHeader">
      <button className="menuButton" type="button" aria-label="メニューを開く" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
      <div className={title === "Velvet" ? "velvetLogo" : "pageTitle"}>{title}</div>
      {rightHref && rightLabel ? <Link className="headerAction" href={rightHref}>{rightLabel}</Link> : <span className="headerSpacer" />}
    </header>
    {open && <div className="drawerLayer" role="presentation" onClick={() => setOpen(false)}>
      <aside className="drawer" aria-label="Velvetメニュー" onClick={event => event.stopPropagation()}>
        <div className="drawerTop"><div><div className="velvetLogo">Velvet</div><div className="drawerMessage">出会いを、ずっと大切に。</div></div><button className="drawerClose" type="button" aria-label="メニューを閉じる" onClick={() => setOpen(false)}>×</button></div>
        <nav className="drawerNav">{menuItems.map(([icon, label, href]) => <Link href={href} key={href} onClick={() => setOpen(false)}><span>{icon}</span>{label}</Link>)}</nav>
        <div className="drawerDivider" />
        <nav className="drawerNav drawerSecondary">
          <Link href="/plans" onClick={() => setOpen(false)}><span>♛</span>プラン</Link>
          <Link href="/settings" onClick={() => setOpen(false)}><span>⚙</span>設定</Link>
        </nav>
        <div className="drawerPlan"><span className="vipMark">♛</span><div><strong>Velvet</strong><small>大切な人との時間を、もっと特別に。</small></div></div>
      </aside>
    </div>}
  </>;
}
