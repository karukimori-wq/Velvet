export type VelvetAuthMode = "demo" | "fixed_owner" | "session";

export function getAuthReadiness() {
  const configuredMode = process.env.VELVET_AUTH_MODE?.trim().toLowerCase();
  const fixedOwner = process.env.VELVET_OWNER_USER_ID?.trim();
  const bridgeSecret = process.env.VELVET_SESSION_BRIDGE_SECRET?.trim();
  const mode: VelvetAuthMode = configuredMode === "session"
    ? "session"
    : configuredMode === "fixed_owner" || fixedOwner
      ? "fixed_owner"
      : "demo";

  const sessionAdapterImplemented = true;
  const sessionConfigured = mode === "session" && Boolean(bridgeSecret);
  // Keep false until every public read/write surface consumes getRequestIdentity().
  // This prevents readiness from claiming safe multi-user auth while legacy
  // fixed-owner consumers still exist.
  const sessionConsumersMigrated = false;
  const productionReady = sessionConfigured && sessionConsumersMigrated;

  return {
    mode,
    productionReady,
    sessionAdapterImplemented,
    sessionConfigured,
    sessionConsumersMigrated,
    fixedOwnerConfigured: Boolean(fixedOwner),
    errorCode: productionReady
      ? null
      : mode !== "session"
        ? "AUTH_SESSION_MODE_REQUIRED"
        : !sessionConfigured
          ? "AUTH_SESSION_BRIDGE_SECRET_MISSING"
          : "AUTH_SESSION_CONSUMERS_NOT_MIGRATED",
  };
}
