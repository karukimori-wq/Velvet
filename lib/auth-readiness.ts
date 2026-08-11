export type VelvetAuthMode = "demo" | "fixed_owner" | "session";

export function getAuthReadiness() {
  const configuredMode = process.env.VELVET_AUTH_MODE?.trim().toLowerCase();
  const fixedOwner = process.env.VELVET_OWNER_USER_ID?.trim();
  const mode: VelvetAuthMode = configuredMode === "session"
    ? "session"
    : fixedOwner
      ? "fixed_owner"
      : "demo";

  // A real per-request session adapter is intentionally not claimed yet.
  // `fixed_owner` is useful for private single-user testing, but would make
  // every public visitor share one owner scope and is therefore not suitable
  // for a public multi-account Velvet deployment.
  const sessionAdapterImplemented = false;
  const productionReady = mode === "session" && sessionAdapterImplemented;

  return {
    mode,
    productionReady,
    sessionAdapterImplemented,
    fixedOwnerConfigured: Boolean(fixedOwner),
    errorCode: productionReady ? null : "AUTH_SESSION_NOT_IMPLEMENTED",
  };
}
