"use client";

import { useMemo,useRef,useState } from "react";
import type { RememberGroup } from "@/lib/remember-fields";

type SpeechRecognitionLike={lang:string;interimResults:boolean;continuous:boolean;start:()=>void;stop:()=>void;onresult:((event:{results:ArrayLike<{0:{transcript:string};isFinal?:boolean}>})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null};
type SpeechRecognitionConstructor=new()=>SpeechRecognitionLike;
declare global{interface Window{SpeechRecognition?:SpeechRecognitionConstructor;webkitSpeechRecognition?:SpeechRecognitionConstructor}}

export function CaptureChatInput({groups,name="value",placeholder}:{groups:RememberGroup[];name?:string;placeholder:string}){
 const [value,setValue]=useState("");const [recording,setRecording]=useState(false);const [unsupported,setUnsupported]=useState(false);const [stampOpen,setStampOpen]=useState(false);const [groupIndex,setGroupIndex]=useState(0);const [fieldLabel,setFieldLabel]=useState("");const recognitionRef=useRef<SpeechRecognitionLike|null>(null);
 const group=groups[groupIndex]??groups[0];const field=useMemo(()=>group?.fields.find(item=>item.label===fieldLabel)??group?.fields[0],[group,fieldLabel]);
 function append(text:string){setValue(current=>{const trimmed=current.trimEnd();return trimmed?`${trimmed}${/[。\n]$/.test(trimmed)?"":"。"}${text}`:text})}
 function addStamp(label:string,content:string){append(`${label}：${content}`)}
 function startRecording(){const Recognition=window.SpeechRecognition??window.webkitSpeechRecognition;if(!Recognition){setUnsupported(true);return}const recognition=new Recognition();recognition.lang="ja-JP";recognition.interimResults=false;recognition.continuous=false;recognition.onresult=event=>{const transcript=Array.from(event.results).map(result=>result[0]?.transcript??"").join("").trim();if(transcript)append(transcript)};recognition.onerror=()=>setRecording(false);recognition.onend=()=>{setRecording(false);recognitionRef.current=null};recognitionRef.current=recognition;setUnsupported(false);setRecording(true);recognition.start()}
 function stopRecording(){recognitionRef.current?.stop();setRecording(false)}
 return <div className="chatComposer">
   <div className="chatInputWrap"><textarea className="searchBox captureTextArea chatTextArea" name={name} value={value} onChange={event=>setValue(event.target.value)} placeholder={placeholder} autoComplete="off" rows={4}/><div className="chatTools"><button className={`composerTool ${stampOpen?"activeAction":""}`} type="button" onClick={()=>setStampOpen(open=>!open)} aria-expanded={stampOpen}><span>▦</span>スタンプ</button><button className={`composerTool ${recording?"recording":""}`} type="button" onClick={recording?stopRecording:startRecording}><span>{recording?"■":"●"}</span>{recording?"停止":"音声"}</button></div></div>
   {stampOpen&&<section className="stampPanel"><div className="stampTabs">{groups.map((item,index)=><button type="button" className={`stampTab ${index===groupIndex?"selectedChip":""}`} key={item.title} onClick={()=>{setGroupIndex(index);setFieldLabel("")}}>{item.title}</button>)}</div><div className="stampFields">{group?.fields.map(item=><button type="button" className={`chip chipButton ${field?.label===item.label?"selectedChip":""}`} key={item.label} onClick={()=>setFieldLabel(item.label)}>{item.label}</button>)}</div>{field&&<div className="stampCandidates"><div className="formHint">{field.label}を選ぶ</div>{field.examples.length>0?<div className="stampGrid">{field.examples.map(example=><button type="button" className="stampButton" key={example} onClick={()=>addStamp(field.label,example)}><strong>{example}</strong><span>{field.label}</span></button>)}</div>:<div className="formHint">自由入力は上のチャット欄に「{field.label}：○○」と入力できます。</div>}</div>}</section>}
   <div className="formHint">{recording?"聞き取っています。止めるとチャット欄に追加します。":unsupported?"この端末では音声入力を利用できません。文字とスタンプは使えます。":"文字・音声・スタンプは同じ欄にまとめて入力できます。"}</div>
 </div>
}
