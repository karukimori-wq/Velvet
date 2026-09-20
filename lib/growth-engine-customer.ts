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

export type GrowthEngineBridgeStatus = {
  configured: boolean;
  baseUrlConfigured: boolean;
  secretConfigured: boolean;
  mode: "trusted_bridge" | "unconfigured";
};

export type GrowthCustomerListResult = {
  customers: GrowthCustomerDisplay[];
  status: "ok" | "unconfigured" | "unavailable";
};

const GROWTH_ENGINE_TIMEOUT_MS = 5000;
const CUSTOMER_CREATE_OPERATION = "Customer.Create";
const CUSTOMER_CREATED_EVENT = "growth.customer.created.v1";

export function getGrowthEngineBaseUrl() {
  return process.env.GROWTH_ENGINE_BASE_URL?.trim() || undefined;
}

function integrationSecret() {
  return process.env.GROWTH_ENGINE_INTEGRATION_SECRET?.trim() || undefined;
}

export function getGrowthEngineBridgeStatus(): GrowthEngineBridgeStatus {
  const baseUrlConfigured = Boolean(getGrowthEngineBaseUrl());
  const secretConfigured = Boolean(integrationSecret());
  return {
    configured: baseUrlConfigured && secretConfigured,
    baseUrlConfigured,
    secretConfigured,
    mode: baseUrlConfigured && secretConfigured ? "trusted_bridge" : "unconfigured",
  };
}

function mapCustomer(raw: Record<string, unknown>): GrowthCustomerDisplay | undefined {
  const customerId = typeof raw.customerId === "string" ? raw.customerId : typeof raw.id === "string" ? raw.id : undefined;
  if (!customerId) return undefined;
  return {
    customerId,
    displayName: typeof raw.name === "string" ? raw.name : typeof raw.displayName === "string" ? raw.displayName : undefined,
    contacts: Array.isArray(raw.contacts)
      ? raw.contacts.flatMap(item => {
          if (!item || typeof item !== "object") return [];
          const row = item as Record<string, unknown>;
          if (typeof row.type !== "string" || typeof row.value !== "string") return [];
          return [{ type: row.type, value: row.value, label: typeof row.label === "string" ? row.label : undefined }];
        })
      : undefined,
  };
}

function trustedHeaders(userId: string) {
  const secret = integrationSecret();
  return {
    "X-Source-App": "velvet",
    "X-User-Id": userId,
    ...(secret ? { "X-Velvet-Integration-Secret": secret } : {}),
  };
}

function trustedCustomerUrl(baseUrl: string, workspaceId: string, customerId?: string) {
  const url = new URL("/api/integrations/velvet/customers", baseUrl);
  url.searchParams.set("workspaceId", workspaceId);
  if (customerId) url.searchParams.set("customerId", customerId);
  return url;
}

function upstreamSignal() {
  return AbortSignal.timeout(GROWTH_ENGINE_TIMEOUT_MS);
}

export async function getGrowthCustomerDisplay(context: GrowthEngineContext): Promise<GrowthCustomerDisplay> {
  const baseUrl = getGrowthEngineBaseUrl();
  const secret = integrationSecret();
  if (!baseUrl || !secret) return { customerId: context.customerId };
  try {
    const response = await fetch(trustedCustomerUrl(baseUrl, context.workspaceId, context.customerId), {
      headers: trustedHeaders(context.userId),
      cache: "no-store",
      signal: upstreamSignal(),
    });
    if (!response.ok) return { customerId: context.customerId };
    const raw = (await response.json()) as Record<string, unknown>;
    const customer = raw.customer && typeof raw.customer === "object" ? (raw.customer as Record<string, unknown>) : raw;
    return mapCustomer(customer) ?? { customerId: context.customerId };
  } catch {
    return { customerId: context.customerId };
  }
}

export async function getGrowthCustomer(workspaceId: string, userId: string, customerId: string) {
  return getGrowthCustomerDisplay({ workspaceId, userId, customerId });
}

export async function listGrowthCustomersWithStatus(workspaceId: string, userId: string): Promise<GrowthCustomerListResult> {
  const baseUrl = getGrowthEngineBaseUrl();
  const secret = integrationSecret();
  if (!baseUrl || !secret) return { customers: [], status: "unconfigured" };

  try {
    const response = await fetch(trustedCustomerUrl(baseUrl, workspaceId), {
      headers: trustedHeaders(userId),
      cache: "no-store",
      signal: upstreamSignal(),
    });
    if (!response.ok) return { customers: [], status: "unavailable" };

    const raw = (await response.json()) as unknown;
    const items = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).customers)
        ? ((raw as Record<string, unknown>).customers as unknown[])
        : undefined;

    if (!items) return { customers: [], status: "unavailable" };

    const customers = items.flatMap(item => {
      if (!item || typeof item !== "object") return [];
      const customer = mapCustomer(item as Record<string, unknown>);
      return customer ? [customer] : [];
    });
    return { customers, status: "ok" };
  } catch {
    return { customers: [], status: "unavailable" };
  }
}

export async function listGrowthCustomers(workspaceId: string, userId: string): Promise<GrowthCustomerDisplay[]> {
  return (await listGrowthCustomersWithStatus(workspaceId, userId)).customers;
}

export async function createGrowthCustomer(workspaceId: string, userId: string, displayName: string): Promise<GrowthCustomerDisplay | undefined> {
  const baseUrl = getGrowthEngineBaseUrl();
  const secret = integrationSecret();
  if (!baseUrl || !secret) return undefined;

  try {
    const response = await fetch(new URL("/api/integrations/velvet/customers", baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...trustedHeaders(userId) },
      body: JSON.stringify({ workspaceId, userId, displayName }),
      cache: "no-store",
      signal: upstreamSignal(),
    });
    if (!response.ok) return undefined;

    const raw = (await response.json()) as Record<string, unknown>;
    if (raw.status !== "success" || raw.operation !== CUSTOMER_CREATE_OPERATION || raw.eventName !== CUSTOMER_CREATED_EVENT) return undefined;
    if (!raw.customer || typeof raw.customer !== "object") return undefined;
    return mapCustomer(raw.customer as Record<string, unknown>);
  } catch {
    return undefined;
  }
}
