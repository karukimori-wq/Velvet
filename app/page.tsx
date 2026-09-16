import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { visibleNextTopics } from "@/lib/next-topic";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";
import { getOwnerPreferences } from "@/lib/owner-preferences";
import { listVisitTimelinesByCustomer } from "@/lib/professional-timeline-repository";
import { listDueNextActions } from "@/lib/professional-next-action-repository";
import { buildSoonVisitAlert, sortSoonVisitAlerts, type SoonVisitAlert } from "@/lib/soon-alerts";
import { startHomeVisitAction } from "./home-actions";

const tokyoDate=(value:Date|string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
const tokyoTime=(value:string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
const isSoonAlert=(value:SoonVisitAlert|undefined):value is SoonVisitAlert=>Boolean(value);

export default async function HomePage(){
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity();
  const [customers,memories,schedule,access,preferences]=await Promise.all([listGrowthCustomers(workspaceId,userId),listCustomerMemories(workspaceId,userId),listScheduleEntries(workspaceId,userId),getPlanAccess(ownerUserId),getOwnerPreferences(ownerUserId)]);
  const customerById=new Map(customers.map(c=>[c.customerId,c])); const memoryByCustomer=new Map(memories.map(m=>[m.customerId,m])); const now=new Date(); const today=tokyoDate(now);
  const todayEntries=schedule.filter(entry=>tokyoDate(entry.startsAt)===today); const todayVisitors=todayEntries.filter(entry=>entry.kind==="visit"&&entry.customerId).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)); const otherToday=todayEntries.filter(entry=>entry.kind!=="visit").sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
  const allCustomerIds=[...new Set([...customers.map(c=>c.customerId),...memories.map(m=>m.customerId)])];
  const visitByCustomer=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?await listVisitTimelinesByCustomer(workspaceId,userId,allCustomerIds):new Map();
  const soonAlerts=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?sortSoonVisitAlerts(allCustomerIds.map(customerId=>buildSoonVisitAlert(customerId,visitByCustomer.get(customerId)??[])).filter(isSoonAlert)).slice(0,5):[];
  const followupAllowed=hasVelvetFeature(access,"followup.manage");
  const followupThrough=new Date(now.getTime()+7*24*60*60*1000);
  const dueFollowups=followupAllowed?await listDueNextActions(workspaceId,userId,followupThrough,5):[];
  const monthKey=today.slice(0,7); const monthEvents=schedule.filter(entry=>tokyoDate(entry.startsAt).startsWith(monthKey)&&entry.kind!=="visit").length;
  const nameFor=(customerId:string)=>customerById.get(customerId)?.displayName??memoryByCustomer.get(customerId)?.displayNameSnapshot??"お客様";
  return <main className="shell homeShell">
    <AppHeader rightHref="/schedule" rightLabel="◷" />
    <div className="homeGreeting"><strong>今日</strong><span>必要なことだけ、ここからすぐに。</span></div>
    <section className="metricGrid" aria-label="今日の概要">
      <Link className="metricCard" href="/schedule"><span className="metricIcon">▣</span><span><span className="metricLabel">今日の予定</span><span className="metricValue">{todayEntries.length}<small>件</small></span></span></Link>
      {followupAllowed?<Link className="metricCard" href="/people?sort=due_followup"><span className="metricIcon">♡</span><span><span className="metricLabel">要フォロー</span><span className="metricValue">{dueFollowups.length}<small>件</small></span></span></Link>:<Link className="metricCard" href="/people"><span className="metricIcon">○</span><span><span className="metricLabel">お客様</span><span className="metricValue">{allCustomerIds.length}<small>名</small></span></span></Link>}
      <Link className="metricCard" href="/schedule"><span className="metricIcon">♢</span><span><span className="metricLabel">今月のイベント</span><span className="metricValue">{monthEvents}<small>件</small></span></span></Link>
      {access.soonAlertsAllowed?<Link className="metricCard" href="/people?sort=soon"><span className="metricIcon">⌛</span><span><span className="metricLabel">そろそろ</span><span className="metricValue">{soonAlerts.length}<small>名</small></span></span></Link>:<Link className="metricCard metricRemember" href="/capture"><span className="metricIcon">＋</span><span><span className="metricLabel">覚える</span><span className="metricWord">今日のこと</span></span></Link>}
    </section>

    <section className={`card actionPanel${dueFollowups.length===0&&soonAlerts.length===0?" actionPanelQuiet":""}`}>
      <div className="row"><div><div className="sectionTitle">今、気にしたいこと</div></div><Link href="/people" className="actionMore">お客様を見る ›</Link></div>
      {dueFollowups.slice(0,3).map(item=>{const dueDate=tokyoDate(item.dueAt!);const label=dueDate<today?"期限を過ぎています":dueDate===today?"今日まで":`${dueDate}まで`;return <Link className="actionLine" href={`/people/${item.customerId}/next-actions`} key={item.id}><span className="actionDot">✓</span><span><strong>{nameFor(item.customerId)}さん</strong><span className="actionMeta">{item.text} · {label}</span></span></Link>})}
      {dueFollowups.length===0&&soonAlerts.slice(0,3).map(alert=><Link className="actionLine" href={`/people/${alert.customerId}`} key={alert.customerId}><span className="actionDot">♡</span><span><strong>{nameFor(alert.customerId)}さん</strong><span className="actionMeta">そろそろかも · 前回来店から{alert.daysSinceLastVisit}日</span></span></Link>)}
      {dueFollowups.length===0&&soonAlerts.length===0&&<div className="actionEmpty"><span>✓</span><div><strong>急ぎのフォローはありません</strong><small>必要なときに、お客様を思い出せます。</small></div></div>}
    </section>

    <div className="sectionHeading"><div><div className="sectionTitle">今日の予定</div></div><Link className="subtle" href="/schedule">すべて見る ›</Link></div>
    <section className="card stack scheduleCard">{todayVisitors.map(entry=>{const customerId=entry.customerId!;const customer=customerById.get(customerId);const memory=memoryByCustomer.get(customerId);const name=customer?.displayName??memory?.displayNameSnapshot??"お客様";const nextTopics=visibleNextTopics(memory?.nextTopicHint,1);return <div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><Link className="timelineTitle" href={`/people/${customerId}`}>{name}さん</Link><div className="formHint">来店予定{nextTopics[0]?` · 次に話す：${nextTopics[0]}`:""}</div><form action={startHomeVisitAction.bind(null,customerId,entry.visitScheduleId)}><button className="secondaryButton compactButton compactForm" type="submit">接客開始</button></form></div></div>})}{otherToday.map(entry=><div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><div className="timelineTitle">{entry.title}</div>{entry.note&&<div className="formHint">{entry.note}</div>}</div></div>)}{todayEntries.length===0&&<div className="empty homeEmpty"><span>○</span><strong>今日は予定がありません</strong><small>お客様を思い出したり、今日のことを覚えておけます。</small></div>}</section>
    <div className="quickSection"><div className="sectionTitle">すぐ使う</div><div className="searchActions"><Link className="secondaryButton actionLink" href="/people">お客様を思い出す</Link><Link className="primaryButton actionLink quickRemember" href="/capture">＋ 覚える</Link></div></div>
    <BottomNav />
  </main>;
}
