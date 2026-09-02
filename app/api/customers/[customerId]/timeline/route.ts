import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";
import { getPlanAccess,hasVelvetFeature } from "@/lib/plan-access";

export async function GET(request: Request,{params}:{params:Promise<{customerId:string}>}){
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity(); const {customerId}=await params;
  const traceId=request.headers.get("x-trace-id")??crypto.randomUUID(); const correlationId=request.headers.get("x-correlation-id")??traceId; const requestId=request.headers.get("x-request-id")??crypto.randomUUID();
  const access=await getPlanAccess(ownerUserId);
  if(!hasVelvetFeature(access,"timeline.integrated"))return NextResponse.json({status:"error",error:{code:"PRO_REQUIRED",message:"Integrated timeline is available on Pro."},plan:access.plan,traceId,correlationId,requestId},{status:403});
  const entries=await listProfessionalTimeline(workspaceId,userId,customerId);
  return NextResponse.json({status:"success",customerId,entries,traceId,correlationId,requestId});
}
