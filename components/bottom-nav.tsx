"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VelvetIcon, type VelvetIconName } from "@/components/velvet-icon";

const items = [
  ["home", "ホーム", "/"],
  ["people", "顧客", "/people"],
  ["plus", "覚える", "/capture"],
  ["search", "思い出す", "/search"],
  ["calendar", "予定", "/schedule"],
] as const;

export function BottomNav(){
  const pathname=usePathname();
  return <nav className="bottomNav" aria-label="メインメニュー">{items.map(([icon,label,href])=>{
    const active=href==="/"?pathname===href:pathname.startsWith(href);
    const capture=href==="/capture";
    return <Link className={`navItem${capture?" captureNav":""}${active?" navActive":""}`} href={href} key={href} aria-current={active?"page":undefined} aria-label={capture?"新しいことを覚える":undefined}><strong aria-hidden="true"><VelvetIcon name={icon as VelvetIconName} /></strong><span className="navLabel">{label}</span></Link>;
  })}</nav>;
}
