import { listCustomerMemories, upsertCustomerMemory } from "@/lib/customer-memory-repository";

export type VelvetImportMemory = {
  customerId: string;
  personalityNote?: string;
  preferenceNote?: string;
  cautionNote?: string;
  conversationSummary?: string;
  lastInteractionSummary?: string;
  nextTopicHint?: string;
  tags?: string[];
  pinned?: boolean;
};

export type VelvetImportPayload = {
  version: "2.0";
  memories: VelvetImportMemory[];
};

export async function exportVelvetData(workspaceId: string, userId: string) {
  const memories = await listCustomerMemories(workspaceId, userId);
  return {
    version: "2.0" as const,
    exportedAt: new Date().toISOString(),
    ownership: {
      customerMaster: "growth-engine",
      velvetData: "professional-memory-only",
    },
    memories: memories.map((memory) => ({
      customerId: memory.customerId,
      personalityNote: memory.personalityNote,
      preferenceNote: memory.preferenceNote,
      cautionNote: memory.cautionNote,
      conversationSummary: memory.conversationSummary,
      lastInteractionSummary: memory.lastInteractionSummary,
      nextTopicHint: memory.nextTopicHint,
      tags: memory.tags,
      pinned: memory.pinned,
    })),
  };
}

export function validateImportPayload(input: unknown): { ok: true; data: VelvetImportPayload } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "JSONオブジェクトではありません" };
  const payload = input as Partial<VelvetImportPayload>;
  if (payload.version !== "2.0") return { ok: false, error: "version は 2.0 が必要です" };
  if (!Array.isArray(payload.memories)) return { ok: false, error: "memories 配列が必要です" };
  const stringFields = ["personalityNote", "preferenceNote", "cautionNote", "conversationSummary", "lastInteractionSummary", "nextTopicHint"] as const;
  for (const [index, memory] of payload.memories.entries()) {
    if (!memory || typeof memory !== "object" || typeof memory.customerId !== "string" || !memory.customerId.trim()) {
      return { ok: false, error: `memories[${index}].customerId が必要です` };
    }
    for (const field of stringFields) {
      if (memory[field] !== undefined && typeof memory[field] !== "string") return { ok: false, error: `memories[${index}].${field} は文字列にしてください` };
    }
    if (memory.tags !== undefined && (!Array.isArray(memory.tags) || memory.tags.some((value) => typeof value !== "string"))) {
      return { ok: false, error: `memories[${index}].tags は文字列配列にしてください` };
    }
    if (memory.pinned !== undefined && typeof memory.pinned !== "boolean") return { ok: false, error: `memories[${index}].pinned はbooleanにしてください` };
  }
  return { ok: true, data: payload as VelvetImportPayload };
}

export async function importVelvetData(payload: VelvetImportPayload, workspaceId: string, userId: string) {
  const importedCustomerIds: string[] = [];
  for (const item of payload.memories) {
    const customerId = item.customerId.trim();
    await upsertCustomerMemory(workspaceId, userId, customerId, {
      personalityNote: item.personalityNote?.trim() || undefined,
      preferenceNote: item.preferenceNote?.trim() || undefined,
      cautionNote: item.cautionNote?.trim() || undefined,
      conversationSummary: item.conversationSummary?.trim() || undefined,
      lastInteractionSummary: item.lastInteractionSummary?.trim() || undefined,
      nextTopicHint: item.nextTopicHint?.trim() || undefined,
      tags: Array.from(new Set((item.tags ?? []).map((value) => value.trim()).filter(Boolean))),
      pinned: item.pinned ?? false,
    });
    importedCustomerIds.push(customerId);
  }
  return { importedCustomerIds };
}
