export const DEMO_OWNER_USER_ID = "user_demo_owner";

/**
 * Authentication seam for the MVP.
 *
 * Development may fall back to a demo owner so the UI can be exercised without
 * an auth provider. Production must never silently use the demo identity.
 *
 * Replace the environment-backed value with the authenticated session owner
 * when the real auth provider is connected.
 */
export function getCurrentOwnerUserId() {
  const configuredOwner = process.env.VELVET_OWNER_USER_ID?.trim();
  if (configuredOwner) return configuredOwner;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_NOT_CONFIGURED: Velvet requires an authenticated owner in production.");
  }

  return DEMO_OWNER_USER_ID;
}

export function isDemoOwner(ownerUserId: string) {
  return ownerUserId === DEMO_OWNER_USER_ID;
}
