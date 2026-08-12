import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getActiveProfessionalVisit } from "@/lib/professional-visit-repository";
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";
import { startVisitAction } from "@/app/visits/actions";

const eventLabels: Record<string, string> = { visit: "来店", conversation: "会話", note: "メモ", gift: "Gift", schedule: "予定", relationship: "関係" };

export default async function PersonDetailPage({ params, searchParams }: { params: Promise<{ personId: string }>; searchParams: Promise<{ justEnded?: string }> }) {
  const { personId: customerId } = await params;
  const { justEnded } = await searchParams;
  const identity = await getRequestIdentity();
  const [customer, memory, timeline, activeVisit] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
    listProfessionalTimeline(identity.workspaceId, identity.userId, customerId),
    getActiveProfessionalVisit(identity.workspaceId, identity.userId, customerId),
  ]);

  const recall = [
    memory?.lastInteractionSummary,
    memory?.conversationSummary,
    memory?.nextTopicHint ? `次回話題 · ${memory.nextTopicHint}` : undefined,
    memory?.cautionNote ? `注意 · ${memory.cautionNote}` : undefined,
  ].filter(Boolean) as string[];
  const chips = [memory?.personalityNote, memory?.preferenceNote, ...(memory?.tags ?? [])].filter(Boolean) as string[];

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/people">‹ People</Link><Link className="subtle" href={`/people/${customerId}/edit`}>メモ編集</Link></header>
    <section className="hero"><h1>{customer.displayName || memory?.displayNameSnapshot || "Customer"}</h1></section>

    {recall.length > 0 && <section className="card noticeCard"><div className="timelineTitle">前回を思い出す</div>{recall.map((value) => <div className="timelineBody" key={value}>{value}</div>)}</section>}

    {justEnded && !activeVisit && <Link className="card actionLink noticeCard" href={`/capture?personId=${customerId}&fromVisit=${encodeURIComponent(justEnded)}`}><div className="timelineTitle">30秒メモ</div><div className="timelineBody">覚えているうちに、タップ中心で残す</div></Link>}

    {chips.length > 0 && <><div className="sectionTitle">パーソナリティ・好み</div><div className="chips">{chips.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}

    {customer.contacts && customer.contacts.length > 0 && <><div className="sectionTitle">連絡先</div><div className="chips">{customer.contacts.map((contact, index) => <span className="chip" key={`${contact.type}-${index}`}>{contact.label || contact.type} · {contact.value}</span>)}</div></>}

    <div className="sectionTitle">クイック操作</div>
    <div className="actions">
      {activeVisit ? <Link className="action actionLink activeAction" href={`/visits/${activeVisit.id}`}>来店中</Link> : <form action={startVisitAction}><input type="hidden" name="customerId" value={customerId} /><button className="action fullAction" type="submit">来店</button></form>}
      <Link className="action actionLink" href={`/capture?personId=${customerId}`}>Capture</Link>
    </div>

    {timeline.length > 0 ? <><div className="sectionTitle">タイムライン</div><div className="timeline">{timeline.map((item) => <details className="timelineItem" key={item.id}><summary><span className="timelineDate">{item.occurredAt.slice(0,10)}{eventLabels[item.eventType] ? ` · ${eventLabels[item.eventType]}` : ""}</span><span className="timelineTitle">{item.title}</span></summary>{item.body && <div className="timelineBody">{item.body}</div>}</details>)}</div></> : <div className="sectionTitle">履歴はまだありません</div>}
    <BottomNav />
  </main>;
}
