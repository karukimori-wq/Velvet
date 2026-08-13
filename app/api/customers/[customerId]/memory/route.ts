import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";

const prohibited = ["name", "phone", "email", "lineId", "rank", "salesAmount", "paymentStatus", "paymentMethod", "stripe", "stripeSecret"];
const obs = (request: Request) => { const traceId=request.headers.get("x-trace-id")??crypto.randomUUID(); return { traceId, correlationId: request.headers.get("x-correlation-id")??traceId, requestId: request.headers.get("x-request-id")??crypto.randomUUID() }; };

export async function GET(request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const { workspaceId, userId } = await getRequestIdentity(); const { customerId } = await params; const ids=obs(request);
  const memory = await getCustomerMemory(workspaceId, userId, customerId);
  return NextResponse.json({ status: "success", customerId, memory: memory ? { memoryId: memory.id, personalityNote: memory.personalityNote, preferenceNote: memory.preferenceNote, cautionNote: memory.cautionNote, conversationSummary: memory.conversationSummary, lastInteractionSummary: memory.lastInteractionSummary, nextTopicHint: memory.nextTopicHint, tags: memory.tags, pinned: memory.pinned, updatedAt: memory.updatedAt } : null, ...ids });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const { workspaceId, userId } = await getRequestIdentity(); const { customerId } = await params; const ids=obs(request);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>; const blocked=prohibited.filter((key)=>key in body);
  if(blocked.length) return NextResponse.json({status:"error",error:{code:"PROHIBITED_FIELDS",message:`Customer/Sales/Payment fields are not writable in Velvet: ${blocked.join(", ")}`},...ids},{status:400});
  const text=(key:string)=>typeof body[key]==="string"?(body[key] as string).trim()||undefined:undefined;
  const memory=await upsertCustomerMemory(workspaceId,userId,customerId,{ personalityNote:text("personalityNote"), preferenceNote:text("preferenceNote"), cautionNote:text("cautionNote"), conversationSummary:text("conversationSummary"), lastInteractionSummary:text("lastInteractionSummary"), nextTopicHint:text("nextTopicHint"), tags:Array.isArray(body.tags)?body.tags.filter((v):v is string=>typeof v==="string"):undefined, pinned:typeof body.pinned==="boolean"?body.pinned:undefined });
  return NextResponse.json({status:"success",memoryId:memory.id,customerId,eventName:"velvet.memory.updated.v1",...ids});
}
