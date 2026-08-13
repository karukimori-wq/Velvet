import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";

export async function POST(request: Request,{params}:{params:Promise<{customerId:string}>}){
  const {workspaceId,userId}=await getRequestIdentity(); const {customerId}=await params;
  const traceId=request.headers.get("x-trace-id")??crypto.randomUUID(); const correlationId=request.headers.get("x-correlation-id")??traceId; const requestId=request.headers.get("x-request-id")??crypto.randomUUID();
  const body=await request.json().catch(()=>({})) as Record<string,unknown>;
  for(const key of ["salesAmount","paymentStatus","paymentMethod","stripe","customer"]){if(key in body)return NextResponse.json({status:"error",error:{code:"PROHIBITED_FIELDS",message:`${key} is not accepted by VelvetNote.Create`},traceId,correlationId,requestId},{status:400});}
  const note=typeof body.note==="string"?body.note.trim():""; if(!note)return NextResponse.json({status:"error",error:{code:"NOTE_REQUIRED",message:"note is required"},traceId,correlationId,requestId},{status:400});
  const item=await addProfessionalTimelineItem({workspaceId,userId,customerId,eventType:"note",title:typeof body.title==="string"&&body.title.trim()?body.title.trim():"接客メモ",body:note});
  return NextResponse.json({status:"success",noteId:item.id,customerId,eventName:"velvet.note.created.v1",traceId,correlationId,requestId},{status:201});
}
