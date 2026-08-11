"use server";

import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { createSelfInvestment, type SelfInvestmentCategory } from "@/lib/self-investment-repository";

export async function createSelfInvestmentAction(formData: FormData) {
  const { ownerUserId } = await getRequestIdentity();
  const category = String(formData.get("category") ?? "other") as SelfInvestmentCategory;
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const occurredAt = String(formData.get("occurredAt") ?? "").trim() || undefined;
  const memo = String(formData.get("memo") ?? "").trim() || undefined;
  const amount = Number(amountRaw);

  const created = await createSelfInvestment({ ownerUserId, category, amount, occurredAt, memo });
  if (!created) redirect("/self-investment?error=1");
  redirect("/self-investment?saved=1");
}
