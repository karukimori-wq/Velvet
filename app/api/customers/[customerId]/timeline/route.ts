import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";

export async function GET(request: Request,{params}:{params:Promise<{customerId:string}>}){
  const {workspaceId,userId}=await getRequestIdentity(); const {customerId}=await params;
  const traceId=request.headers.get("x-trace-id")??crypto.randomUUID(); const correlationId=request.headers.get("x-correlation-id")??traceId; const requestId=request.headers.get("x-request-id")??crypto.randomUUID();
  const entries=await listProfessionalTimeline(workspaceId,userId,customerId);
  return NextResponse.json({status:"success",customerId,entries,traceId,correlationId,requestId});
}
