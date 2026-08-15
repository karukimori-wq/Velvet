const separator = "\n";

export function parseNextTopics(value?: string): string[] {
  if (!value) return [];
  return Array.from(new Set(value.split(/\r?\n|・/).map((item) => item.trim()).filter(Boolean)));
}

export function mergeNextTopics(existing: string | undefined, additions: string[], limit = 5): string | undefined {
  const merged = Array.from(new Set([...additions.map((item) => item.trim()).filter(Boolean), ...parseNextTopics(existing)]));
  return merged.length ? merged.slice(0, limit).join(separator) : undefined;
}
