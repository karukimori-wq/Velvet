"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VelvetIcon, type VelvetIconName } from "@/components/velvet-icon";

const items = [
  ["home", "ホーム", "/"],
  ["people", "顧客", "/people"],
  ["plus", "覚える", "/add"],
  ["search", "思い出す", "/search"],
  ["calendar", "予定", "/schedule"],
] as const;

export function BottomNav(){
  const pathname=usePathname();
  return <nav className="bottomNav" aria-label="メインメニュー">{items.map(([icon,label,href])=>{
    const remember=icon==="plus";
    const active=remember?pathname.startsWith("/add")||pathname.startsWith("/capture")||pathname.startsWith("/remember"):href==="/"?pathname===href:pathname.startsWith(href);
    return <Link className={`navItem${remember?" captureNav":""}${active?" navActive":""}`} href={href} key={href} aria-current={active?"page":undefined} aria-label={remember?"覚える入口を開く":undefined}><strong aria-hidden="true"><VelvetIcon name={icon as VelvetIconName} /></strong><span className="navLabel">{label}</span></Link>;
  })}</nav>;
}
