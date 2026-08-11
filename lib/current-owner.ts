export const DEMO_OWNER_USER_ID = "user_demo_owner";

/**
 * Authentication seam for the MVP.
 * Replace this function with the real authenticated session lookup.
 * Repositories should receive ownerUserId from callers instead of inventing it.
 */
export function getCurrentOwnerUserId() {
  return DEMO_OWNER_USER_ID;
}
