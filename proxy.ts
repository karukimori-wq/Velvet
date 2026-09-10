import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/api/health",
  "/api/version",
  "/api/contracts/status",
  "/api/persistence/status",
]);

function hasTrustedBridge(request: Request) {
  const expected = process.env.VELVET_SESSION_BRIDGE_SECRET?.trim();
  const supplied = request.headers.get("x-velvet-auth-bridge");
  return Boolean(expected && supplied && expected === supplied);
}

export default clerkMiddleware(async (auth, request) => {
  if (process.env.VELVET_AUTH_MODE?.trim().toLowerCase() !== "clerk") return;

  const pathname = request.nextUrl.pathname;
  if (pathname === "/auth" || PUBLIC_PATHS.has(pathname)) return;

  // The bridge secret is server-only and preserves production E2E/service
  // requests during Clerk cutover. Identity headers are validated again by
  // getRequestIdentity before application data is accessed.
  if (hasTrustedBridge(request)) return;

  const { isAuthenticated } = await auth();
  if (isAuthenticated) return;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ status: "error", code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const authUrl = new URL("/auth", request.url);
  authUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(authUrl);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
