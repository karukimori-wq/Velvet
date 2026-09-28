"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { VelvetIcon, type VelvetIconName } from "@/components/velvet-icon";

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader({ title = "Velvet", rightHref, rightLabel }: { title?: string; rightHref?: string; rightLabel?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const drawerLink = (icon: VelvetIconName, label: string, href: string) => {
    const active = isActiveRoute(pathname, href);
    return <Link className={active ? "drawerActive" : undefined} href={href} key={href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><span><VelvetIcon name={icon} /></span>{label}</Link>;
  };

  return <>
    <header className="velvetHeader">
      <button className="menuButton" type="button" aria-label="メニューを開く" aria-expanded={open} aria-controls="velvet-drawer" onClick={() => setOpen(true)}>☰</button>
      <div className={title === "Velvet" ? "velvetLogo" : "pageTitle"}>{title}</div>
      {rightHref && rightLabel ? <Link className="headerAction" href={rightHref}>{rightLabel === "history" ? <VelvetIcon name="history" /> : rightLabel}</Link> : <span className="headerSpacer" />}
    </header>
    {open && <div className="drawerLayer" role="presentation" onClick={() => setOpen(false)}>
      <aside className="drawer" id="velvet-drawer" aria-label="Velvetメニュー" onClick={event => event.stopPropagation()}>
        <div className="drawerTop"><div><div className="velvetLogo">Velvet</div><div className="drawerMessage">覚えて、思い出して、次につなぐ。</div></div><button className="drawerClose" type="button" aria-label="メニューを閉じる" onClick={() => setOpen(false)}>×</button></div>
        <div className="drawerSectionLabel">その他</div>
        <nav className="drawerNav drawerSecondary">
          {drawerLink("plan", "プラン", "/plans")}
          {drawerLink("settings", "設定", "/settings")}
        </nav>
        <div className="drawerHint">ホーム・顧客・覚える・思い出す・予定は、画面下のメニューからいつでも開けます。</div>
        <div className="drawerPlan"><span className="vipMark">♛</span><div><strong>Velvet</strong><small>大切な人との時間を、次の時間へ。</small></div></div>
      </aside>
    </div>}
  </>;
}
