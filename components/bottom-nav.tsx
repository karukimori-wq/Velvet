"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["⌂", "ホーム", "/"],
  ["♙", "顧客", "/people"],
  ["＋", "覚える", "/capture"],
  ["⌕", "思い出す", "/search"],
  ["▣", "予定", "/schedule"],
] as const;

export function BottomNav(){
  const pathname=usePathname();
  return <nav className="bottomNav" aria-label="メインメニュー">{items.map(([icon,label,href])=>{
    const active=href==="/"?pathname===href:pathname.startsWith(href);
    const capture=href==="/capture";
    return <Link className={`navItem${capture?" captureNav":""}${active?" navActive":""}`} href={href} key={href} aria-current={active?"page":undefined} aria-label={capture?"新しいことを覚える":undefined}><strong aria-hidden="true">{icon}</strong><span className="navLabel">{label}</span></Link>;
  })}</nav>;
}
