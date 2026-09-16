import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

const prohibited = ["name", "phone", "email", "lineId", "rank", "salesAmount", "paymentStatus", "paymentMethod", "stripe", "stripeSecret"];
const textFields = ["personalityNote","preferenceNote","cautionNote","conversationSummary","lastInteractionSummary","nextTopicHint"] as const;
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
  for(const key of textFields){if(key in body&&typeof body[key]!=="string")return NextResponse.json({status:"error",error:{code:"INVALID_MEMORY_FIELD",message:`${key} must be a string`},...ids},{status:400});if(typeof body[key]==="string"&&(body[key] as string).trim().length>INPUT_LIMITS.memoryField)return NextResponse.json({status:"error",error:{code:"MEMORY_FIELD_TOO_LONG",message:`${key} must be ${INPUT_LIMITS.memoryField} characters or fewer`},...ids},{status:400});}
  if("tags" in body&&(!Array.isArray(body.tags)||body.tags.some(v=>typeof v!=="string")))return NextResponse.json({status:"error",error:{code:"INVALID_MEMORY_TAGS",message:"tags must be a string array"},...ids},{status:400});
  const tags=Array.isArray(body.tags)?Array.from(new Set(body.tags.map(v=>String(v).trim()).filter(Boolean))):undefined;
  if(tags&&(tags.length>INPUT_LIMITS.memoryTags||tags.some(v=>v.length>INPUT_LIMITS.memoryTag)))return NextResponse.json({status:"error",error:{code:"MEMORY_TAGS_TOO_LARGE",message:`tags support up to ${INPUT_LIMITS.memoryTags} values of ${INPUT_LIMITS.memoryTag} characters each`},...ids},{status:400});
  if("pinned" in body&&typeof body.pinned!=="boolean")return NextResponse.json({status:"error",error:{code:"INVALID_PINNED",message:"pinned must be boolean"},...ids},{status:400});
  const text=(key:string)=>typeof body[key]==="string"?(body[key] as string).trim()||undefined:undefined;
  const memory=await upsertCustomerMemory(workspaceId,userId,customerId,{ personalityNote:text("personalityNote"), preferenceNote:text("preferenceNote"), cautionNote:text("cautionNote"), conversationSummary:text("conversationSummary"), lastInteractionSummary:text("lastInteractionSummary"), nextTopicHint:text("nextTopicHint"), tags, pinned:typeof body.pinned==="boolean"?body.pinned:undefined });
  return NextResponse.json({status:"success",memoryId:memory.id,customerId,eventName:"velvet.memory.updated.v1",...ids});
}
