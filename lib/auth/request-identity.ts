import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { DEMO_OWNER_USER_ID } from "@/lib/current-owner";

export type RequestIdentity = {
  userId: string;
  ownerUserId: string;
  workspaceId: string;
  source: "demo" | "fixed_owner" | "session_bridge";
};

function authMode() {
  const value = process.env.VELVET_AUTH_MODE?.trim().toLowerCase();
  if (value === "session") return "session" as const;
  if (value === "fixed_owner") return "fixed_owner" as const;
  return "demo" as const;
}

function secretMatches(expected: string, supplied: string | null) {
  if (!supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}

/**
 * Server-only request identity boundary.
 *
 * In session mode Velvet accepts identity headers only when a trusted upstream
 * auth layer also supplies the shared bridge secret. Public clients must never
 * know VELVET_SESSION_BRIDGE_SECRET.
 *
 * Replace this bridge with a direct Clerk/Auth.js/Supabase session adapter when
 * the authentication provider is selected. Repository code must continue to
 * consume only the returned ownerUserId/workspaceId, never client form values.
 */
export async function getRequestIdentity(): Promise<RequestIdentity> {
  const mode = authMode();

  if (mode === "demo") {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_DEMO_FORBIDDEN_IN_PRODUCTION");
    return { userId: DEMO_OWNER_USER_ID, ownerUserId: DEMO_OWNER_USER_ID, workspaceId: "workspace_demo", source: "demo" };
  }

  if (mode === "fixed_owner") {
    const ownerUserId = process.env.VELVET_OWNER_USER_ID?.trim();
    if (!ownerUserId) throw new Error("AUTH_FIXED_OWNER_MISSING");
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_FIXED_OWNER_FORBIDDEN_FOR_PUBLIC_PRODUCTION");
    return { userId: ownerUserId, ownerUserId, workspaceId: `workspace_${ownerUserId}`, source: "fixed_owner" };
  }

  const bridgeSecret = process.env.VELVET_SESSION_BRIDGE_SECRET?.trim();
  if (!bridgeSecret) throw new Error("AUTH_SESSION_BRIDGE_SECRET_MISSING");

  const requestHeaders = await headers();
  const suppliedSecret = requestHeaders.get("x-velvet-auth-bridge");
  if (!secretMatches(bridgeSecret, suppliedSecret)) throw new Error("AUTH_SESSION_BRIDGE_INVALID");

  const userId = requestHeaders.get("x-velvet-user-id")?.trim();
  const ownerUserId = requestHeaders.get("x-velvet-owner-user-id")?.trim();
  const workspaceId = requestHeaders.get("x-velvet-workspace-id")?.trim();
  if (!userId || !ownerUserId || !workspaceId) throw new Error("AUTH_SESSION_IDENTITY_MISSING");

  return { userId, ownerUserId, workspaceId, source: "session_bridge" };
}
