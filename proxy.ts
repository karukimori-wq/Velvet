import { clerkMiddleware } from "@clerk/nextjs/server";

const PUBLIC_PATHS = new Set([
  "/api/health",
  "/api/version",
  "/api/contracts/status",
  "/api/persistence/status",
]);

export default clerkMiddleware(async (auth, request) => {
  // Trusted E2E/service-bridge production still uses session mode. Clerk must
  // not become a dependency for those requests until the public cutover.
  if (process.env.VELVET_AUTH_MODE?.trim().toLowerCase() !== "clerk") return;

  const pathname = request.nextUrl.pathname;
  if (pathname === "/auth" || PUBLIC_PATHS.has(pathname)) return;

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
