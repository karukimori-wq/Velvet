"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["⌂", "ホーム", "/"],
  ["♙", "顧客", "/people"],
  ["▤", "記録", "/capture"],
  ["▣", "予定", "/schedule"],
] as const;

export function BottomNav(){
  const pathname=usePathname();
  return <nav className="bottomNav" aria-label="メインメニュー">{items.map(([icon,label,href])=>{
    const active=href==="/"?pathname===href:pathname.startsWith(href);
    return <Link className={`navItem${active?" navActive":""}`} href={href} key={href} aria-current={active?"page":undefined}><strong>{icon}</strong>{label}</Link>;
  })}</nav>;
}
