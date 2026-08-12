export type GrowthCustomerDisplay = {
  customerId: string;
  displayName?: string;
  contacts?: Array<{ type: string; value: string; label?: string }>;
};

export type GrowthEngineContext = {
  workspaceId: string;
  userId: string;
  customerId: string;
  reservationId?: string;
  visitScheduleId?: string;
  intent?: string;
};

export function getGrowthEngineBaseUrl() {
  return process.env.GROWTH_ENGINE_BASE_URL?.trim() || undefined;
}

export async function getGrowthCustomerDisplay(context: GrowthEngineContext): Promise<GrowthCustomerDisplay> {
  const baseUrl = getGrowthEngineBaseUrl();
  if (!baseUrl) return { customerId: context.customerId };
  const url = new URL(`/api/customers/${encodeURIComponent(context.customerId)}`, baseUrl);
  url.searchParams.set("workspaceId", context.workspaceId);
  const response = await fetch(url, { headers: { "X-Source-App": "velvet", "X-User-Id": context.userId }, cache: "no-store" });
  if (!response.ok) return { customerId: context.customerId };
  const raw = await response.json() as Record<string, unknown>;
  return {
    customerId: context.customerId,
    displayName: typeof raw.name === "string" ? raw.name : typeof raw.displayName === "string" ? raw.displayName : undefined,
    contacts: Array.isArray(raw.contacts) ? raw.contacts.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      if (typeof row.type !== "string" || typeof row.value !== "string") return [];
      return [{ type: row.type, value: row.value, label: typeof row.label === "string" ? row.label : undefined }];
    }) : undefined,
  };
}

export async function getGrowthCustomer(workspaceId: string, userId: string, customerId: string) {
  return getGrowthCustomerDisplay({ workspaceId, userId, customerId });
}
