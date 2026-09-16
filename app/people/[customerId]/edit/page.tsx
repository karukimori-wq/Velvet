import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { INPUT_LIMITS } from "@/lib/input-limits";
import { updateCustomerMemoryAction } from "./actions";

export default async function EditCustomerMemoryPage({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { customerId } = await params;
  const { error } = await searchParams;
  const identity = await getRequestIdentity();
  const [customer, memory] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
  ]);
  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ 戻る</Link><span className="subtle">接客メモ編集</span></header>
    <section className="hero"><h1>{customer.displayName || memory?.displayNameSnapshot || "Customer"}</h1><p>名前・連絡先などのCustomer情報はGrowth Engineで管理します。ここではVelvetの専門メモだけ編集します。</p></section>
    {error === "too_long" && <div className="formError">入力が長すぎる項目があります。内容を短くしてもう一度保存してください。</div>}
    <form action={updateCustomerMemoryAction.bind(null, customerId)} className="stack">
      <textarea className="searchBox" name="personalityNote" maxLength={INPUT_LIMITS.memoryField} placeholder="人柄・特徴" defaultValue={memory?.personalityNote ?? ""} />
      <textarea className="searchBox" name="preferenceNote" maxLength={INPUT_LIMITS.memoryField} placeholder="好み" defaultValue={memory?.preferenceNote ?? ""} />
      <textarea className="searchBox" name="cautionNote" maxLength={INPUT_LIMITS.memoryField} placeholder="注意点" defaultValue={memory?.cautionNote ?? ""} />
      <textarea className="searchBox" name="conversationSummary" maxLength={INPUT_LIMITS.memoryField} placeholder="最近の会話メモ" defaultValue={memory?.conversationSummary ?? ""} />
      <textarea className="searchBox" name="lastInteractionSummary" maxLength={INPUT_LIMITS.memoryField} placeholder="前回対応内容" defaultValue={memory?.lastInteractionSummary ?? ""} />
      <textarea className="searchBox" name="nextTopicHint" maxLength={INPUT_LIMITS.memoryField} placeholder="次回話題" defaultValue={memory?.nextTopicHint ?? ""} />
      <input className="searchBox" name="tags" maxLength={INPUT_LIMITS.memoryTags * (INPUT_LIMITS.memoryTag + 1)} placeholder="タグ（、区切り）" defaultValue={(memory?.tags ?? []).join("、")} />
      <button className="primaryButton" type="submit">保存</button>
    </form>
  </main>;
}
