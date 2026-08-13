import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { upsertCustomerMemory } from "@/lib/customer-memory-repository";

export async function POST(request: Request,{params}:{params:Promise<{customerId:string}>}){
  const {workspaceId,userId}=await getRequestIdentity(); const {customerId}=await params;
  const traceId=request.headers.get("x-trace-id")??crypto.randomUUID(); const correlationId=request.headers.get("x-correlation-id")??traceId; const requestId=request.headers.get("x-request-id")??crypto.randomUUID();
  const body=await request.json().catch(()=>({})) as Record<string,unknown>;
  for(const key of ["salesAmount","paymentStatus","paymentMethod","stripe","customer"]){if(key in body)return NextResponse.json({status:"error",error:{code:"PROHIBITED_FIELDS",message:`${key} is not accepted by VelvetNextAction.Create`},traceId,correlationId,requestId},{status:400});}
  const text=typeof body.text==="string"?body.text.trim():""; if(!text)return NextResponse.json({status:"error",error:{code:"NEXT_ACTION_REQUIRED",message:"text is required"},traceId,correlationId,requestId},{status:400});
  const item=await addProfessionalTimelineItem({workspaceId,userId,customerId,eventType:"next_action",title:"次回対応",body:text});
  await upsertCustomerMemory(workspaceId,userId,customerId,{nextTopicHint:text});
  const nextActionRef=`velvet:next-action:${item.id}`;
  return NextResponse.json({status:"success",customerId,nextActionRef,eventName:"velvet.next_action.created.v1",traceId,correlationId,requestId},{status:201});
}
