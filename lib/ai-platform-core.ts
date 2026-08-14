import { createTraceContext, traceHeaders, type TraceContext } from "@/lib/observability";

export type AiPlatformStatus = { configured:boolean; endpoint?:string; contractReady:boolean; gatewayPath:string; clientConfigured:boolean };
export type CaptureCandidate = { type:"knowledge"|"preference"|"next_topic"|"schedule"|"gift"|"unknown"; value:string };
export type StructuredCaptureResult = { status:"success"|"warning"; mode:"ai"|"local"; candidates:CaptureCandidate[]; trace:TraceContext; activityId?:string; errorCode?:string };
export type SearchIntentResult = { status:"success"|"warning"; mode:"ai"|"local"; terms:string[]; trace:TraceContext; activityId?:string; errorCode?:string };

function baseUrl(){return process.env.AI_PLATFORM_CORE_URL?.trim().replace(/\/$/,"");}
function gatewayPath(){return process.env.AI_PLATFORM_CORE_GATEWAY_PATH?.trim()||"/v1/gateway/run";}
function clientId(){return process.env.AI_PLATFORM_CORE_CLIENT_ID?.trim();}
export function getAiPlatformStatus():AiPlatformStatus{const endpoint=baseUrl();return{configured:Boolean(endpoint),endpoint:endpoint||undefined,contractReady:true,gatewayPath:gatewayPath(),clientConfigured:Boolean(clientId())};}
function gatewayEndpoint(){const base=baseUrl();if(!base)return undefined;const path=gatewayPath();return`${base}${path.startsWith("/")?path:`/${path}`}`;}

export function organizeCaptureLocally(raw:string):CaptureCandidate[]{
  const values=raw.split(/[。\n]+/).flatMap(value=>value.split(/[、,]/)).map(value=>value.trim()).filter(Boolean);
  return values.map(value=>{
    if(/次回|今度.*聞|聞いてみ|確認する|どうだった.*聞/.test(value))return{type:"next_topic",value};
    if(/好き|ハマって|好み|よく飲む|苦手|嫌い/.test(value))return{type:"preference",value};
    if(/もらった|貰った|あげた|プレゼント|お土産/.test(value))return{type:"gift",value};
    // Only explicit appointments/reminders become schedules. A customer's trip or future event is knowledge unless the user says to schedule/remind it.
    if(/(?:予定に|スケジュールに|リマインド|予約|来店予定|出勤予定)/.test(value)&&/(?:明日|来週|来月|\d{1,2}[月\/\-]\d{1,2}|\d{1,2}日|\d{1,2}:\d{2})/.test(value))return{type:"schedule",value};
    return{type:"knowledge",value};
  });
}

function localSearchTerms(raw:string){return Array.from(new Set(raw.normalize("NFKC").replace(/[、。,.!?！？/・]/g," ").split(/\s+|好き|で|の|人|客|お客様|探して|教えて/).map(value=>value.trim()).filter(Boolean)));}
function safeJsonFromText(text:unknown):unknown{if(typeof text!=="string")return undefined;const trimmed=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");try{return JSON.parse(trimmed);}catch{return undefined;}}

async function runGateway(input:{capability:"velvet.capture.structure"|"velvet.search.parse_intent";permission:"velvet.capture.structure"|"velvet.search.parse_intent";ownerUserId:string;workspaceId?:string;goal:string;payload:Record<string,unknown>;prompt:string;trace:TraceContext}){
  const endpoint=gatewayEndpoint();const client=clientId();if(!endpoint||!client)return undefined;
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",...traceHeaders(input.trace)},cache:"no-store",body:JSON.stringify({auth:{clientId:client,permissions:[input.permission]},activity:{client,...(input.workspaceId?{workspaceId:input.workspaceId}:{}),userId:input.ownerUserId,ownerUserId:input.ownerUserId,capability:input.capability,workflow:"velvet",goal:input.goal,context:{app:"Velvet",sourceApp:"velvet"},input:input.payload},messages:[{role:"system",content:"Return JSON only. Do not add prose or markdown fences."},{role:"user",content:input.prompt}]})});
  if(!response.ok)throw new Error(`AI Platform Core returned ${response.status}`);const body=await response.json() as{ok?:boolean;result?:{activityId?:string;output?:Record<string,unknown>}};if(!body.ok||!body.result)throw new Error("Invalid gateway response");return{activityId:body.result.activityId,parsed:safeJsonFromText(body.result.output?.text)};
}

export async function structureCapture(raw:string,ownerUserId:string,traceSeed?:Partial<TraceContext>):Promise<StructuredCaptureResult>{
  const trace=createTraceContext(traceSeed);if(!gatewayEndpoint()||!clientId())return{status:"warning",mode:"local",candidates:organizeCaptureLocally(raw),trace,errorCode:"AI_CAPABILITY_NOT_CONFIGURED"};
  try{const result=await runGateway({capability:"velvet.capture.structure",permission:"velvet.capture.structure",ownerUserId,goal:"Structure one user-entered Velvet contact note into candidate records without mutating Velvet data.",payload:{rawText:raw},prompt:`Classify this Velvet contact note into JSON: {"candidates":[{"type":"knowledge|preference|next_topic|schedule|gift|unknown","value":"..."}]}. knowledge=new facts about the customer including their future trips/events; preference=likes/dislikes or habitual choices; next_topic=something the user explicitly wants to ask or continue next time; schedule=ONLY an appointment/reminder the user intends to put on their own schedule, not a customer's casual future plan; gift=given/received gift. Preserve meaning and do not invent facts. Note: ${JSON.stringify(raw)}`,trace});const parsed=result?.parsed as{candidates?:unknown}|undefined;const candidates=Array.isArray(parsed?.candidates)?parsed.candidates.filter((item):item is CaptureCandidate=>{if(!item||typeof item!=="object")return false;const record=item as Record<string,unknown>;return["knowledge","preference","next_topic","schedule","gift","unknown"].includes(String(record.type))&&typeof record.value==="string";}):[];if(!candidates.length)throw new Error("No candidates");return{status:"success",mode:"ai",candidates,trace,activityId:result?.activityId};}catch{return{status:"warning",mode:"local",candidates:organizeCaptureLocally(raw),trace,errorCode:"AI_UPSTREAM_FALLBACK"};}
}

export async function parseSearchIntent(raw:string,ownerUserId:string,traceSeed?:Partial<TraceContext>):Promise<SearchIntentResult>{
  const trace=createTraceContext(traceSeed);if(!gatewayEndpoint()||!clientId())return{status:"warning",mode:"local",terms:localSearchTerms(raw),trace,errorCode:"AI_CAPABILITY_NOT_CONFIGURED"};
  try{const result=await runGateway({capability:"velvet.search.parse_intent",permission:"velvet.search.parse_intent",ownerUserId,goal:"Parse a user-triggered Velvet search phrase into local search terms only.",payload:{query:raw},prompt:`Convert this Velvet search into JSON only: {"terms":["term1","term2"]}. Remove particles and generic words such as 人/客/探して. Do not infer facts. Query: ${JSON.stringify(raw)}`,trace});const parsed=result?.parsed as{terms?:unknown}|undefined;const terms=Array.isArray(parsed?.terms)?parsed.terms.map(String).map(v=>v.trim()).filter(Boolean):[];if(!terms.length)throw new Error("No terms");return{status:"success",mode:"ai",terms,trace,activityId:result?.activityId};}catch{return{status:"warning",mode:"local",terms:localSearchTerms(raw),trace,errorCode:"AI_UPSTREAM_FALLBACK"};}
}
