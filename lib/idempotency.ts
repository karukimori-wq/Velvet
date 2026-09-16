export function makeIdempotentRecordId(prefix: string, key: string) {
  const normalized = key.trim().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
  if (!normalized) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  return `${prefix}_${normalized}`;
}
