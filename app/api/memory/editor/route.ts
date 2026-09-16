import { NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory, upsertCustomerMemory } from "@/lib/customer-memory-repository";
import { addProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { INPUT_LIMITS } from "@/lib/input-limits";

export async function POST(request: Request) {
  const { workspaceId, userId } = await getRequestIdentity();
  const body = await request.json().catch(() => ({})) as { customerId?: unknown; tags?: unknown };
  if (typeof body.customerId !== "string" || !body.customerId.trim() || body.customerId.trim().length > INPUT_LIMITS.customerId) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_CUSTOMER_ID" } }, { status: 400 });
  }
  if (!Array.isArray(body.tags) || !body.tags.every(tag => typeof tag === "string")) {
    return NextResponse.json({ status: "error", error: { code: "INVALID_MEMORY_TAGS" } }, { status: 400 });
  }
  const customerId = body.customerId.trim();
  const tags = Array.from(new Set(body.tags.map(tag => tag.trim()).filter(Boolean)));
  if (tags.length > INPUT_LIMITS.memoryTags || tags.some(tag => tag.length > INPUT_LIMITS.memoryTag)) {
    return NextResponse.json({ status: "error", error: { code: "MEMORY_TAGS_TOO_LARGE" } }, { status: 400 });
  }
  const before = await getCustomerMemory(workspaceId, userId, customerId);
  const previous = before?.tags ?? [];
  await upsertCustomerMemory(workspaceId, userId, customerId, { tags });
  const added = tags.filter(tag => !previous.includes(tag));
  const removed = previous.filter(tag => !tags.includes(tag));
  if (added.length || removed.length) {
    await addProfessionalTimelineItem({ workspaceId, userId, customerId, eventType: "note", title: "人物情報をまとめて更新", body: [...added.map(tag => `＋ ${tag}`), ...removed.map(tag => `− ${tag}`)].join("\n") });
  }
  return NextResponse.json({ status: "success", saved: tags.length, added: added.length, removed: removed.length });
}
