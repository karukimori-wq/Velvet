export const INPUT_LIMITS = {
  capture: 4000,
  professionalNote: 4000,
  noteTitle: 120,
  nextAction: 500,
  giftItem: 200,
  giftOccasion: 200,
  giftNote: 1000,
  memoryField: 4000,
  memoryTag: 120,
  memoryTags: 100,
} as const;

export function withinTextLimit(value: unknown, limit: number, required = false) {
  if (typeof value !== "string") return !required && (value === undefined || value === null);
  const text = value.trim();
  if (required && !text) return false;
  return text.length <= limit;
}
