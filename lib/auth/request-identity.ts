import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { DEMO_OWNER_USER_ID } from "@/lib/current-owner";

export type RequestIdentity = {
  userId: string;
  ownerUserId: string;
  workspaceId: string;
  source: "demo" | "fixed_owner" | "session_bridge" | "clerk";
};

function authMode() {
  const value = process.env.VELVET_AUTH_MODE?.trim().toLowerCase();
  if (value === "clerk") return "clerk" as const;
  if (value === "session") return "session" as const;
  if (value === "fixed_owner") return "fixed_owner" as const;
  return "demo" as const;
}

function isSafeVercelPreviewDemo() {
  const onVercel = process.env.VERCEL === "1";
  const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
  const explicitPostgres = process.env.VELVET_STORAGE_MODE?.trim().toLowerCase() === "postgres";
  return onVercel && !hasDatabase && !explicitPostgres;
}

function secretMatches(expected: string, supplied: string | null) {
  if (!supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}

async function trustedBridgeIdentity(): Promise<RequestIdentity | null> {
  const bridgeSecret = process.env.VELVET_SESSION_BRIDGE_SECRET?.trim();
  if (!bridgeSecret) return null;
  const requestHeaders = await headers();
  if (!secretMatches(bridgeSecret, requestHeaders.get("x-velvet-auth-bridge"))) return null;
  const userId = requestHeaders.get("x-velvet-user-id")?.trim();
  const ownerUserId = requestHeaders.get("x-velvet-owner-user-id")?.trim();
  const workspaceId = requestHeaders.get("x-velvet-workspace-id")?.trim();
  if (!userId || !ownerUserId || !workspaceId) throw new Error("AUTH_SESSION_IDENTITY_MISSING");
  return { userId, ownerUserId, workspaceId, source: "session_bridge" };
}

/** Public production uses Clerk. A request carrying the server-only bridge
 * secret may still use the trusted identity headers for production E2E and
 * service-to-service checks. Ordinary browser requests can never select this
 * path without that secret. */
export async function getRequestIdentity(): Promise<RequestIdentity> {
  const mode = authMode();

  if (mode === "demo") {
    if (process.env.NODE_ENV === "production" && !isSafeVercelPreviewDemo()) throw new Error("AUTH_DEMO_FORBIDDEN_IN_PRODUCTION");
    return { userId: DEMO_OWNER_USER_ID, ownerUserId: DEMO_OWNER_USER_ID, workspaceId: "workspace_demo", source: "demo" };
  }

  if (mode === "fixed_owner") {
    const ownerUserId = process.env.VELVET_OWNER_USER_ID?.trim();
    if (!ownerUserId) throw new Error("AUTH_FIXED_OWNER_MISSING");
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_FIXED_OWNER_FORBIDDEN_FOR_PUBLIC_PRODUCTION");
    return { userId: ownerUserId, ownerUserId, workspaceId: `workspace_${ownerUserId}`, source: "fixed_owner" };
  }

  if (mode === "clerk") {
    const bridge = await trustedBridgeIdentity();
    if (bridge) return bridge;
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated || !userId) throw new Error("AUTH_CLERK_UNAUTHENTICATED");
    return { userId, ownerUserId: userId, workspaceId: `workspace_${userId}`, source: "clerk" };
  }

  const bridgeSecret = process.env.VELVET_SESSION_BRIDGE_SECRET?.trim();
  if (!bridgeSecret) throw new Error("AUTH_SESSION_BRIDGE_SECRET_MISSING");
  const bridge = await trustedBridgeIdentity();
  if (!bridge) throw new Error("AUTH_SESSION_BRIDGE_INVALID");
  return bridge;
}
