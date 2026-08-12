import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { updateCustomerMemoryAction } from "./actions";

export default async function EditPersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId: customerId } = await params;
  const identity = await getRequestIdentity();
  const [customer, memory] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
  ]);

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ 戻る</Link><span className="subtle">接客メモ編集</span></header>
      <section className="hero"><h1>{customer.displayName || memory?.displayNameSnapshot || "Customer"}</h1><p>名前・連絡先などのCustomer情報はGrowth Engineで管理します。ここではVelvetの専門メモだけ編集します。</p></section>

      <form action={updateCustomerMemoryAction.bind(null, customerId)} className="stack">
        <textarea className="searchBox" name="personalityNote" placeholder="人柄・特徴" defaultValue={memory?.personalityNote ?? ""} />
        <textarea className="searchBox" name="preferenceNote" placeholder="好み" defaultValue={memory?.preferenceNote ?? ""} />
        <textarea className="searchBox" name="cautionNote" placeholder="注意点" defaultValue={memory?.cautionNote ?? ""} />
        <textarea className="searchBox" name="conversationSummary" placeholder="最近の会話メモ" defaultValue={memory?.conversationSummary ?? ""} />
        <textarea className="searchBox" name="lastInteractionSummary" placeholder="前回対応内容" defaultValue={memory?.lastInteractionSummary ?? ""} />
        <textarea className="searchBox" name="nextTopicHint" placeholder="次回話題" defaultValue={memory?.nextTopicHint ?? ""} />
        <input className="searchBox" name="tags" placeholder="タグ（、区切り）" defaultValue={(memory?.tags ?? []).join("、")} />
        <label className="choiceChip"><input type="checkbox" name="pinned" defaultChecked={memory?.pinned ?? false} /> 重要顧客としてピン留め</label>
        <button className="primaryButton" type="submit">保存</button>
      </form>
    </main>
  );
}
