"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const screenNames: Array<[RegExp,string]> = [
  [/^\/people\/[^/]+\/next-actions/,"Next Action"],
  [/^\/people\/[^/]+/,"Professional Memory"],
  [/^\/remember/,"Professional Memory編集"],
  [/^\/capture/,"Capture"],
  [/^\/visits\/[^/]+/,"Visit"],
  [/^\/visits/,"Visit"],
  [/^\/people/,"お客様一覧"],
  [/^\/schedule/,"予定"],
  [/^\/$/,"ホーム"],
];

function screenNameFor(pathname:string){return screenNames.find(([pattern])=>pattern.test(pathname))?.[1]??"Velvet"}

export function FeedbackHubLauncher(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [message,setMessage]=useState("");
  const [sending,setSending]=useState(false);
  const [result,setResult]=useState<{status:"success"|"warning"|"error";message:string}|null>(null);
  const [connected,setConnected]=useState<boolean|null>(null);
  const screenName=useMemo(()=>screenNameFor(pathname),[pathname]);

  useEffect(()=>{fetch("/api/feedback",{cache:"no-store"}).then(r=>r.json()).then(v=>setConnected(Boolean(v.connected))).catch(()=>setConnected(false))},[]);

  async function submit(){
    const initialMessage=message.trim(); if(!initialMessage||sending)return;
    setSending(true);setResult(null);
    try{
      const response=await fetch("/api/feedback",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({route:pathname,screenName,initialMessage,device:navigator.platform||"unknown",browser:navigator.userAgent})});
      const body=await response.json().catch(()=>({}));
      if(response.ok&&body.status==="success"){setMessage("");setResult({status:"success",message:"送信しました。"});setConnected(true)}
      else if(response.ok&&body.status==="skipped"){setResult({status:"warning",message:"Feedback Hubは未接続です。入力内容は保存されていません。"});setConnected(false)}
      else setResult({status:"error",message:"送信できませんでした。時間をおいてもう一度お試しください。"});
    }catch{setResult({status:"error",message:"送信できませんでした。通信状態をご確認ください。"})}finally{setSending(false)}
  }

  return <>
    <button type="button" className="feedbackLauncher" onClick={()=>{setOpen(true);setResult(null)}} aria-label="質問・改善を送る">?</button>
    {open&&<div className="feedbackBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
      <section className="feedbackSheet" role="dialog" aria-modal="true" aria-label="質問・改善">
        <div className="feedbackHeader"><div><strong>質問・改善</strong><span>{screenName}</span></div><button type="button" className="feedbackClose" onClick={()=>setOpen(false)} aria-label="閉じる">×</button></div>
        <div className={`feedbackConnection ${connected?"connected":"disconnected"}`}>{connected===null?"接続確認中":connected?"Feedback Hub 接続中":"Feedback Hub 未接続"}</div>
        <div className="feedbackBubble">困ったこと、不具合、改善してほしいことをそのまま書いてください。</div>
        <textarea className="feedbackInput" value={message} onChange={e=>setMessage(e.target.value)} placeholder="例：この画面で保存したあと、どこを押せばいいか分かりにくい" rows={5}/>
        <div className="feedbackPrivacy">この画面名と操作場所だけを添えて送ります。Professional Memoryやメモ本文を自動で丸ごと送ることはありません。</div>
        {result&&<div className={`feedbackResult ${result.status}`}>{result.message}</div>}
        <button type="button" className="feedbackSend" disabled={sending||!message.trim()} onClick={submit}>{sending?"送信中…":"送る"}</button>
      </section>
    </div>}
  </>
}
