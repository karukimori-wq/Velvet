import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface R2ObjectBodyLike {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

export interface R2BucketLike {
  put(key: string, value: ArrayBuffer | ReadableStream, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<unknown>;
  get(key: string): Promise<R2ObjectBodyLike | null>;
  delete(key: string): Promise<void>;
}

export async function getMediaBucket(): Promise<R2BucketLike | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    return (context.env as unknown as { MEDIA?: R2BucketLike }).MEDIA ?? null;
  } catch {
    return null;
  }
}

export function makeMediaKey(input: { workspaceId: string; userId: string; customerId: string; fileName?: string }) {
  const extension = input.fileName?.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const suffix = extension ? `.${extension}` : "";
  return `velvet/${encodeURIComponent(input.workspaceId)}/${encodeURIComponent(input.userId)}/${encodeURIComponent(input.customerId)}/${crypto.randomUUID()}${suffix}`;
}
