import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import pkg from "@/package.json";

const APP_ID="velvet",APP_NAME="Velvet";
function baseUrl(){return process.env.FEEDBACK_HUB_BASE_URL?.trim().replace(/\/$/,"")||undefined}
function feedbackSecret(){return process.env.FEEDBACK_HUB_INTEGRATION_SECRET?.trim()||undefined}
function safeString(value:unknown,max=5000){return typeof value==="string"?value.trim().slice(0,max):""}
function safeRoute(value:unknown){const route=safeString(value,300);return route.startsWith("/")?route.split("?")[0]:"/"}
function outboundHeaders(secret:string|undefined,traceId:string,correlationId:string,requestId:string){return {"content-type":"application/json","x-source-app":"velvet","x-trace-id":traceId,"x-correlation-id":correlationId,"x-request-id":requestId,...(secret?{"x-feedback-hub-integration-secret":secret}:{})}}
function observability(request?:Request){const traceId=request?.headers.get("x-trace-id")??crypto.randomUUID();const correlationId=request?.headers.get("x-correlation-id")??traceId;const requestId=request?.headers.get("x-request-id")??crypto.randomUUID();return{traceId,correlationId,requestId}}
function minimalReferences(route:string){const refs:Record<string,string>={};const customer=route.match(/^\/people\/([^/]+)/)?.[1]??new URL(`https://velvet.invalid${route}`).searchParams.get("customerId")??undefined;const visit=route.match(/^\/visits\/([^/]+)/)?.[1];if(customer)refs.customerId=customer.slice(0,160);if(visit)refs.visitId=visit.slice(0,160);return refs}

export async function GET(request:Request){const obs=observability(request);const base=baseUrl();if(!base)return NextResponse.json({status:"success",connected:false,mode:"mock",...obs});try{const response=await fetch(`${base}/api/embed/config?appId=${APP_ID}`,{headers:outboundHeaders(feedbackSecret(),obs.traceId,obs.correlationId,obs.requestId),cache:"no-store"});return NextResponse.json({status:"success",connected:response.ok,mode:response.ok?"feedback_hub":"mock",...obs})}catch{return NextResponse.json({status:"success",connected:false,mode:"mock",...obs})}}

export async function POST(request:Request){
  const identity=await getRequestIdentity();
  const obs=observability(request);
  const body=await request.json().catch(()=>({})) as Record<string,unknown>;
  const initialMessage=safeString(body.initialMessage,5000);
  if(!initialMessage)return NextResponse.json({status:"error",error:{code:"INITIAL_MESSAGE_REQUIRED",message:"initialMessage is required"},...obs},{status:400});
  const route=safeRoute(body.route);
  const userAgent=request.headers.get("user-agent")??"unknown";
  const payload={
    appId:APP_ID,appName:APP_NAME,
    workspaceId:identity.workspaceId,userId:identity.userId,ownerUserId:identity.ownerUserId,
    route,screenName:safeString(body.screenName,120)||"Velvet",
    appVersion:pkg.version,device:safeString(body.device,160)||"unknown",browser:safeString(body.browser,600)||userAgent,
    occurredAt:new Date().toISOString(),initialMessage,
    context:{source:"velvet_feedback_ui",references:minimalReferences(route)},
    ...obs
  };
  const base=baseUrl();
  if(!base)return NextResponse.json({status:"skipped",connected:false,mode:"mock",reason:"FEEDBACK_HUB_NOT_CONFIGURED",...obs});
  const secret=feedbackSecret();
  for(const path of ["/api/embed/feedback","/api/feedback/intake"]){
    try{
      const response=await fetch(`${base}${path}`,{method:"POST",headers:outboundHeaders(secret,obs.traceId,obs.correlationId,obs.requestId),body:JSON.stringify(payload),cache:"no-store"});
      if(response.ok){const result=await response.json().catch(()=>({}));return NextResponse.json({status:"success",connected:true,target:path,feedbackRef:(result as Record<string,unknown>).feedbackId??(result as Record<string,unknown>).id??undefined,...obs})}
      if(response.status!==404&&response.status!==405)return NextResponse.json({status:"error",connected:true,error:{code:"FEEDBACK_HUB_REJECTED",statusCode:response.status},...obs},{status:502});
    }catch{}
  }
  return NextResponse.json({status:"error",connected:false,error:{code:"FEEDBACK_HUB_UNREACHABLE"},...obs},{status:502});
}
