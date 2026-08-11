export type AiCapabilityKey = "capture.structure" | "search.parse_intent" | "analysis.advanced";
export type AiCostClass = "none" | "S" | "M" | "L";

export type AiCostPolicy = {
  capability: AiCapabilityKey;
  costClass: AiCostClass;
  chargeable: boolean;
  requiresConnectedUsage: boolean;
};

const POLICIES: Record<AiCapabilityKey, AiCostPolicy> = {
  "capture.structure": {
    capability: "capture.structure",
    costClass: "S",
    chargeable: true,
    requiresConnectedUsage: true,
  },
  "search.parse_intent": {
    capability: "search.parse_intent",
    costClass: "M",
    chargeable: true,
    requiresConnectedUsage: true,
  },
  "analysis.advanced": {
    capability: "analysis.advanced",
    costClass: "L",
    chargeable: true,
    requiresConnectedUsage: true,
  },
};

export function getAiCostPolicy(capability: AiCapabilityKey) {
  return POLICIES[capability];
}

export function getLocalFallbackPolicy() {
  return {
    costClass: "none" as const,
    chargeable: false,
    requiresConnectedUsage: false,
  };
}
