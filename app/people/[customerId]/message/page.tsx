import Link from "next/link";
import { MessageDraftForm } from "@/components/message-draft-form";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getMessageDraftStatus } from "@/lib/message-draft";
import { getPlanAccess } from "@/lib/plan-access";
import { requestMessageDraftAction } from "./actions";

export default async function MessageDraftPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params; const identity = await getRequestIdentity();
  const [customer, memory, access] = await Promise.all([getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }), getCustomerMemory(identity.workspaceId, identity.userId, customerId), getPlanAccess(identity.ownerUserId)]);
  const integration = getMessageDraftStatus(); const displayName=customer.displayName||memory?.displayNameSnapshot||"お客様"; const available=access.messageDraftAllowed&&integration.configured; const action=requestMessageDraftAction.bind(null,customerId);
  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ {displayName}</Link><span className="subtle">連絡文案</span></header>
    <section className="hero"><h1>{displayName}さんへの文案</h1><p>送りたい雰囲気だけ選べば、文案を作れます。</p></section>
    {!access.messageDraftAllowed&&<div className="card noticeCard"><div className="timelineTitle">連絡文案はPro機能です</div><div className="timelineBody">LINE、Instagram DM、メール、SMS向けの文案を、お客様の記録をもとに作れます。</div><Link className="secondaryButton actionLink compactForm" href="/plans">Proを見る</Link></div>}
    {access.messageDraftAllowed&&!integration.configured&&<div className="card noticeCard"><div className="timelineTitle">文案作成は準備中です</div><div className="timelineBody">接続設定が完了すると、この画面から文案を作れるようになります。</div></div>}
    <MessageDraftForm action={action} available={available} allowed={access.messageDraftAllowed} suggestion={memory?.nextTopicHint}/>
  </main>;
}
