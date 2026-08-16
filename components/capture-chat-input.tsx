"use client";

import { useEffect,useMemo,useRef,useState } from "react";
import type { RememberGroup } from "@/lib/remember-fields";

type SpeechRecognitionLike={lang:string;interimResults:boolean;continuous:boolean;start:()=>void;stop:()=>void;onresult:((event:{results:ArrayLike<{0:{transcript:string};isFinal?:boolean}>})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null};
type SpeechRecognitionConstructor=new()=>SpeechRecognitionLike;
type RecentStamp={label:string;content:string};
declare global{interface Window{SpeechRecognition?:SpeechRecognitionConstructor;webkitSpeechRecognition?:SpeechRecognitionConstructor}}
const RECENT_KEY="velvet:recent-stamps:v1";

export function CaptureChatInput({groups,name="value",placeholder}:{groups:RememberGroup[];name?:string;placeholder:string}){
 const [value,setValue]=useState("");const [recording,setRecording]=useState(false);const [unsupported,setUnsupported]=useState(false);const [stampOpen,setStampOpen]=useState(false);const [tab,setTab]=useState<"recent"|number>("recent");const [fieldLabel,setFieldLabel]=useState("");const [recent,setRecent]=useState<RecentStamp[]>([]);const recognitionRef=useRef<SpeechRecognitionLike|null>(null);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(RECENT_KEY)??"[]") as RecentStamp[];if(Array.isArray(saved))setRecent(saved.filter(item=>item&&typeof item.label==="string"&&typeof item.content==="string").slice(0,12))}catch{}},[]);
 const group=typeof tab==="number"?(groups[tab]??groups[0]):undefined;const field=useMemo(()=>group?.fields.find(item=>item.label===fieldLabel)??group?.fields[0],[group,fieldLabel]);
 function append(text:string){setValue(current=>{const trimmed=current.trimEnd();return trimmed?`${trimmed}${/[。\n]$/.test(trimmed)?"":"。"}${text}`:text})}
 function rememberStamp(stamp:RecentStamp){setRecent(current=>{const next=[stamp,...current.filter(item=>!(item.label===stamp.label&&item.content===stamp.content))].slice(0,12);try{localStorage.setItem(RECENT_KEY,JSON.stringify(next))}catch{}return next})}
 function addStamp(label:string,content:string){append(`${label}：${content}`);rememberStamp({label,content})}
 function startRecording(){const Recognition=window.SpeechRecognition??window.webkitSpeechRecognition;if(!Recognition){setUnsupported(true);return}const recognition=new Recognition();recognition.lang="ja-JP";recognition.interimResults=false;recognition.continuous=false;recognition.onresult=event=>{const transcript=Array.from(event.results).map(result=>result[0]?.transcript??"").join("").trim();if(transcript)append(transcript)};recognition.onerror=()=>setRecording(false);recognition.onend=()=>{setRecording(false);recognitionRef.current=null};recognitionRef.current=recognition;setUnsupported(false);setRecording(true);recognition.start()}
 function stopRecording(){recognitionRef.current?.stop();setRecording(false)}
 return <div className="chatComposer">
   <div className="chatInputWrap"><textarea className="searchBox captureTextArea chatTextArea" name={name} value={value} onChange={event=>setValue(event.target.value)} placeholder={placeholder} autoComplete="off" rows={4}/><div className="chatTools"><button className={`composerTool ${stampOpen?"activeAction":""}`} type="button" onClick={()=>setStampOpen(open=>!open)} aria-expanded={stampOpen}><span>▦</span>スタンプ</button><button className={`composerTool ${recording?"recording":""}`} type="button" onClick={recording?stopRecording:startRecording}><span>{recording?"■":"●"}</span>{recording?"停止":"音声"}</button></div></div>
   {stampOpen&&<section className="stampPanel">
     <div className="stampTabs" role="tablist" aria-label="スタンプ分類"><button type="button" className={`stampTab ${tab==="recent"?"selectedChip":""}`} onClick={()=>{setTab("recent");setFieldLabel("")}}>最近</button>{groups.map((item,index)=><button type="button" className={`stampTab ${tab===index?"selectedChip":""}`} key={item.title} onClick={()=>{setTab(index);setFieldLabel("")}}>{item.title}</button>)}</div>
     {tab==="recent"?<div className="stampCandidates"><div className="formHint">最近使ったスタンプ</div>{recent.length?<div className="stampGrid">{recent.map(stamp=><button type="button" className="stampButton" key={`${stamp.label}-${stamp.content}`} onClick={()=>addStamp(stamp.label,stamp.content)}><strong>{stamp.content}</strong><span>{stamp.label}</span></button>)}</div>:<div className="stampEmpty">まだありません。分類から使うと、ここに最近使ったものが並びます。</div>}</div>:<><div className="stampFields">{group?.fields.map(item=><button type="button" className={`chip chipButton ${field?.label===item.label?"selectedChip":""}`} key={item.label} onClick={()=>setFieldLabel(item.label)}>{item.label}</button>)}</div>{field&&<div className="stampCandidates"><div className="formHint">{field.label}を選ぶ</div>{field.examples.length>0?<div className="stampGrid">{field.examples.map(example=><button type="button" className="stampButton" key={example} onClick={()=>addStamp(field.label,example)}><strong>{example}</strong><span>{field.label}</span></button>)}</div>:<div className="stampEmpty">決まった候補はありません。上のチャット欄に「{field.label}：○○」と入力できます。</div>}</div>}</>}
   </section>}
   <div className="formHint">{recording?"聞き取っています。止めるとチャット欄に追加します。":unsupported?"この端末では音声入力を利用できません。文字とスタンプは使えます。":"文字・音声・スタンプは同じ欄にまとめて入力できます。"}</div>
 </div>
}
