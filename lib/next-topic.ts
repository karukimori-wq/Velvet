export function parseNextTopics(value?: string): string[] {
  if (!value) return [];
  return Array.from(new Set(
    value
      .split(/\n+/)
      .map((item) => item.replace(/^[-・•]\s*/, "").trim())
      .filter(Boolean),
  ));
}

export function mergeNextTopics(existing: string | undefined, incoming: string[], limit = 5): string {
  const current = parseNextTopics(existing);
  const cleanIncoming = incoming.map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set([...cleanIncoming, ...current])).slice(0, limit).join("\n");
}

export function visibleNextTopics(value?: string, limit = 3): string[] {
  return parseNextTopics(value).slice(0, limit);
}
