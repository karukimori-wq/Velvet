import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getActiveProfessionalVisit } from "@/lib/professional-visit-repository";
import { listProfessionalTimeline, type ProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { visibleNextTopics } from "@/lib/next-topic";
import { startVisitAction } from "@/app/visits/actions";
import { toggleCustomerPinAction } from "./actions";

const eventLabels: Record<string, string> = { visit: "来店", conversation: "会話", note: "メモ", gift: "贈り物", schedule: "予定", relationship: "関係" };
const appearanceLabels = ["髪", "メガネ", "顔の特徴", "服装", "時計", "財布", "アクセサリー"];
const personalityLabels = ["仕事", "結婚", "出身", "趣味", "人柄", "家族"];
const preferenceLabels = ["よく飲むもの", "好きなもの", "苦手なもの", "着席理由", "注意点"];

function tagLabel(value: string) { const index = value.indexOf("："); return index >= 0 ? value.slice(0, index) : ""; }
function TimelineRows({ items }: { items: ProfessionalTimelineItem[] }) { return <div className="timeline">{items.map((item) => <details className="timelineItem" key={item.id}><summary><span className="timelineDate">{item.occurredAt.slice(0,10)}{eventLabels[item.eventType] ? ` · ${eventLabels[item.eventType]}` : ""}</span><span className="timelineTitle">{item.title}</span></summary>{item.body && <div className="timelineBody">{item.body}</div>}</details>)}</div>; }

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
  const nextTopics = visibleNextTopics(memory?.nextTopicHint, 3);
  const recall = [
    memory?.cautionNote && { label: "注意", value: memory.cautionNote },
    memory?.lastInteractionSummary && { label: "前回", value: memory.lastInteractionSummary },
    memory?.preferenceNote && { label: "好み", value: memory.preferenceNote },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const tags = memory?.tags ?? [];
  const personality = [memory?.personalityNote, ...tags.filter((value) => personalityLabels.includes(tagLabel(value)))].filter(Boolean) as string[];
  const appearance = tags.filter((value) => appearanceLabels.includes(tagLabel(value)));
  const preferences = tags.filter((value) => preferenceLabels.includes(tagLabel(value)));
  const otherTags = tags.filter((value) => !appearanceLabels.includes(tagLabel(value)) && !personalityLabels.includes(tagLabel(value)) && !preferenceLabels.includes(tagLabel(value)));
  const recentTimeline = timeline.slice(0, 5);
  const olderTimeline = timeline.slice(5);

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/people">‹ お客様</Link><div className="searchActions"><form action={toggleCustomerPinAction.bind(null, customerId)}><button className="subtle" type="submit" aria-label={memory?.pinned ? "ピンを外す" : "大切なお客様としてピン留めする"}>{memory?.pinned ? "★" : "☆"}</button></form><Link className="subtle" href={`/remember?customerId=${encodeURIComponent(customerId)}`}>編集</Link></div></header>
    <section className="hero"><h1>{displayName}</h1></section>
    {captureSaved && <div className="card successCard">今日の接客を記録しました</div>}

    {(recall.length > 0 || nextTopics.length > 0) && <section className="card noticeCard"><div className="timelineTitle">会う前に確認</div><div className="stack">{recall.slice(0,2).map((item) => <div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}{nextTopics.length > 0 && <div><div className="formHint">次に話すこと</div><div className="stack">{nextTopics.map((topic) => <div className="timelineBody" key={topic}>・{topic}</div>)}</div></div>}{recall.slice(2).map((item) => <div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}</div></section>}

    {justEnded && !activeVisit && <Link className="card actionLink noticeCard" href={`/capture?customerId=${customerId}&fromVisit=${encodeURIComponent(justEnded)}`}><div className="timelineTitle">今日の接客を残す</div><div className="timelineBody">覚えているうちに、話したことをそのまま記録</div></Link>}
    {personality.length > 0 && <><div className="sectionTitle">人となり</div><div className="chips">{personality.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}
    {appearance.length > 0 && <><div className="sectionTitle">見た目・持ち物</div><div className="chips">{appearance.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}
    {preferences.length > 0 && <><div className="sectionTitle">好み・接客</div><div className="chips">{preferences.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}
    {otherTags.length > 0 && <><div className="sectionTitle">その他</div><div className="chips">{otherTags.map((value) => <span className="chip" key={value}>{value}</span>)}</div></>}

    <div className="sectionTitle">すぐ使う</div><div className="searchActions">{activeVisit ? <Link className="primaryButton actionLink" href={`/visits/${activeVisit.id}`}>接客中を見る</Link> : <form action={startVisitAction}><input type="hidden" name="customerId" value={customerId} /><button className="primaryButton" type="submit">来店を記録</button></form>}<Link className="secondaryButton actionLink" href={`/capture?customerId=${customerId}`}>今日の接客を残す</Link></div>
    <div className="actions" style={{ marginTop: 8 }}><Link className="action actionLink" href={`/people/${customerId}/message`}>連絡文案</Link><Link className="action actionLink" href={`/people/${customerId}/gift`}>贈り物</Link><Link className="action actionLink" href={`/relationships/new?customerId=${customerId}`}>関係</Link></div>

    {recentTimeline.length > 0 ? <><div className="sectionTitle">最近の記録</div><TimelineRows items={recentTimeline} />{olderTimeline.length > 0 && <details className="detailsCard"><summary>以前の記録を見る（{olderTimeline.length}件）</summary><div className="detailsBody"><TimelineRows items={olderTimeline} /></div></details>}</> : <div className="sectionTitle">履歴はまだありません</div>}
    {customer.contacts && customer.contacts.length > 0 && <details className="detailsCard"><summary>連絡先</summary><div className="chips detailsBody">{customer.contacts.map((contact, index) => <span className="chip" key={`${contact.type}-${index}`}>{contact.label || contact.type} · {contact.value}</span>)}</div></details>}
    <BottomNav />
  </main>;
}
