export function getBillingReadiness() {
  const growthEngineConfigured = Boolean(process.env.GROWTH_ENGINE_BASE_URL?.trim());
  const subscriptionContractReady = false;
  const aiPointPurchaseContractReady = false;

  return {
    status: "warning" as const,
    growthEngineConfigured,
    subscriptionContractReady,
    aiPointPurchaseContractReady,
    proPriceTargetJpy: 10000,
    responsibilities: {
      paymentCanonicalOwner: "growth-engine",
      aiUsageCanonicalOwner: "ai-platform-core",
      velvetEntitlementProjection: "velvet_owner_entitlements",
    },
    issues: [
      ...(!subscriptionContractReady ? ["SUBSCRIPTION_PAYMENT_CONTRACT_NOT_APPROVED"] : []),
      ...(!aiPointPurchaseContractReady ? ["AI_POINT_PURCHASE_CONTRACT_NOT_APPROVED"] : []),
    ],
  };
}
