import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getActiveProfessionalVisit } from "@/lib/professional-visit-repository";
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";
import { startVisitAction } from "@/app/visits/actions";
import { toggleCustomerPinAction } from "./actions";

const eventLabels: Record<string, string> = { visit: "来店", conversation: "会話", note: "メモ", gift: "贈り物", schedule: "予定", relationship: "関係" };

export default async function CustomerDetailPage({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<{ justEnded?: string; captureSaved?: string }> }) {
  const { customerId } = await params;
  const { justEnded, captureSaved } = await searchParams;
  const identity = await getRequestIdentity();
  const [customer, memory, timeline, activeVisit] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
    listProfessionalTimeline(identity.workspaceId, identity.userId, customerId),
    getActiveProfessionalVisit(identity.workspaceId, identity.userId, customerId),
  ]);
  const displayName = customer.displayName || memory?.displayNameSnapshot || "お客様";
  const recall = [
    memory?.cautionNote && { label: "注意", value: memory.cautionNote },
    memory?.lastInteractionSummary && { label: "前回", value: memory.lastInteractionSummary },
    memory?.nextTopicHint && { label: "次に話すこと", value: memory.nextTopicHint },
    memory?.preferenceNote && { label: "好み", value: memory.preferenceNote },
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const profileChips = [memory?.personalityNote, ...(memory?.tags ?? [])].filter(Boolean) as string[];

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/people">‹ お客様</Link><div className="searchActions"><form action={toggleCustomerPinAction.bind(null, customerId)}><button className="subtle" type="submit" aria-label={memory?.pinned ? "ピンを外す" : "大切なお客様としてピン留めする"}>{memory?.pinned ? "★" : "☆"}</button></form><Link className="subtle" href={`/remember?customerId=${encodeURIComponent(customerId)}`}>覚えたことを編集</Link></div></header>
    <section className="hero"><h1>{displayName}</h1></section>
    {captureSaved && <div className="card successCard">今日の接客を記録しました</div>}
    {recall.length > 0 && <section className="card noticeCard"><div className="timelineTitle">会う前に確認</div><div className="stack">{recall.map((item) => <div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}</div></section>}
    {justEnded && !activeVisit && <Link className="card actionLink noticeCard" href={`/capture?customerId=${customerId}&fromVisit=${encodeURIComponent(justEnded)}`}><div className="timelineTitle">今日の接客を残す</div><div className="timelineBody">覚えているうちに、話したことをそのまま記録</div></Link>}
    {profileChips.length > 0 && <><div className="sectionTitle">この人について</div><div className="chips">{profileChips.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}
    {customer.contacts && customer.contacts.length > 0 && <><div className="sectionTitle">連絡先</div><div className="chips">{customer.contacts.map((contact, index) => <span className="chip" key={`${contact.type}-${index}`}>{contact.label || contact.type} · {contact.value}</span>)}</div></>}
    <div className="sectionTitle">すぐ使う</div><div className="actions">{activeVisit ? <Link className="action actionLink activeAction" href={`/visits/${activeVisit.id}`}>接客中</Link> : <form action={startVisitAction}><input type="hidden" name="customerId" value={customerId} /><button className="action fullAction" type="submit">来店</button></form>}<Link className="action actionLink" href={`/capture?customerId=${customerId}`}>接客メモ</Link><Link className="action actionLink" href={`/people/${customerId}/message`}>連絡文案</Link><Link className="action actionLink" href={`/people/${customerId}/gift`}>贈り物</Link><Link className="action actionLink" href={`/relationships/new?customerId=${customerId}`}>関係</Link></div>
    {timeline.length > 0 ? <><div className="sectionTitle">これまで</div><div className="timeline">{timeline.map((item) => <details className="timelineItem" key={item.id}><summary><span className="timelineDate">{item.occurredAt.slice(0,10)}{eventLabels[item.eventType] ? ` · ${eventLabels[item.eventType]}` : ""}</span><span className="timelineTitle">{item.title}</span></summary>{item.body && <div className="timelineBody">{item.body}</div>}</details>)}</div></> : <div className="sectionTitle">履歴はまだありません</div>}
    <BottomNav />
  </main>;
}
