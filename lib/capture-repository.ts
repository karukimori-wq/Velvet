import { addPersonKnowledge, getPerson } from "@/lib/demo-data";

export type CaptureKind = "knowledge" | "drink" | "work" | "hobby" | "appearance" | "accessory" | "marital_status" | "free_text";

export type CaptureEntry = {
  id: string;
  ownerUserId: string;
  personId?: string;
  kind: CaptureKind;
  value: string;
  createdAt: string;
};

const entries: CaptureEntry[] = [];

function makeId() {
  return `capture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listCaptures(ownerUserId: string, personId?: string) {
  return entries.filter((entry) => entry.ownerUserId === ownerUserId && (!personId || entry.personId === personId));
}

export function getCapture(id: string, ownerUserId: string) {
  return entries.find((entry) => entry.id === id && entry.ownerUserId === ownerUserId);
}

export function createCapture(input: { ownerUserId: string; personId?: string; kind?: CaptureKind; value: string }) {
  const value = input.value.trim();
  if (!value) return undefined;
  if (input.personId && !getPerson(input.personId, input.ownerUserId)) return undefined;

  const entry: CaptureEntry = {
    id: makeId(),
    ownerUserId: input.ownerUserId,
    personId: input.personId,
    kind: input.kind ?? "free_text",
    value,
    createdAt: new Date().toISOString(),
  };
  entries.unshift(entry);

  // Deterministic user-entered capture can be reused immediately as memory.
  // AI-inferred restructuring must use a separate confirmation flow.
  if (input.personId && entry.kind !== "free_text") {
    addPersonKnowledge(input.personId, value, input.ownerUserId);
  }

  return entry;
}
