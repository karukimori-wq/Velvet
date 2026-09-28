"use client";

import { useEffect, useState, type ReactNode } from "react";

export function NewCustomerDetails({planLabel,children}:{planLabel:string;children:ReactNode}){
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const syncFromHash=()=>setOpen(window.location.hash==="#new-customer");
    syncFromHash();
    window.addEventListener("hashchange",syncFromHash);
    return()=>window.removeEventListener("hashchange",syncFromHash);
  },[]);
  return <details className="detailsCard addCustomerDetails" id="new-customer" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>＋ 新しいお客様を追加 <span>{planLabel}</span></summary><div className="detailsBody">{children}</div></details>;
}
