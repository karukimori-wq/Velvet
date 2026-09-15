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
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";
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
  const soonAlerts=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?sortSoonVisitAlerts((await Promise.all(allCustomerIds.map(async customerId=>buildSoonVisitAlert(customerId,await listProfessionalTimeline(workspaceId,userId,customerId))))).filter(isSoonAlert)).slice(0,5):[];
  const followupThrough=new Date(now.getTime()+7*24*60*60*1000);
  const dueFollowups=hasVelvetFeature(access,"followup.manage")?await listDueNextActions(workspaceId,userId,followupThrough,5):[];
  const monthKey=today.slice(0,7); const monthEvents=schedule.filter(entry=>tokyoDate(entry.startsAt).startsWith(monthKey)&&entry.kind!=="visit").length;
  const nameFor=(customerId:string)=>customerById.get(customerId)?.displayName??memoryByCustomer.get(customerId)?.displayNameSnapshot??"お客様";
  return <main className="shell">
    <AppHeader rightHref="/schedule" rightLabel="♧" />
    <div className="homeGreeting"><strong>おかえりなさい</strong><span>今日も、大切な人との時間をもっと特別に。</span></div>
    <section className="metricGrid" aria-label="今日の概要">
      <Link className="metricCard" href="/schedule"><span className="metricIcon">▣</span><span><span className="metricLabel">今日の予定</span><span className="metricValue">{todayEntries.length}件</span></span></Link>
      <Link className="metricCard" href="/people?sort=due_followup"><span className="metricIcon">♡</span><span><span className="metricLabel">要フォロー</span><span className="metricValue">{dueFollowups.length}件</span></span></Link>
      <Link className="metricCard" href="/schedule"><span className="metricIcon">♢</span><span><span className="metricLabel">今月のイベント</span><span className="metricValue">{monthEvents}件</span></span></Link>
      <Link className="metricCard" href="/people?sort=soon"><span className="metricIcon">⌛</span><span><span className="metricLabel">そろそろ</span><span className="metricValue">{soonAlerts.length}名</span></span></Link>
    </section>

    {(dueFollowups.length>0||soonAlerts.length>0)&&<section className="card actionPanel"><div className="row"><div className="sectionTitle">本日のアクション</div><Link href="/people" className="formHint">すべて見る ›</Link></div>{dueFollowups.slice(0,3).map(item=>{const dueDate=tokyoDate(item.dueAt!);const label=dueDate<today?"期限を過ぎています":dueDate===today?"今日まで":`${dueDate}まで`;return <Link className="actionLine" href={`/people/${item.customerId}/next-actions`} key={item.id}><span className="actionDot">✓</span><span><strong>{nameFor(item.customerId)}さん</strong><span className="formHint"> · {item.text} · {label}</span></span></Link>})}{dueFollowups.length===0&&soonAlerts.slice(0,3).map(alert=><Link className="actionLine" href={`/people/${alert.customerId}`} key={alert.customerId}><span className="actionDot">♡</span><span>{nameFor(alert.customerId)}さん、そろそろかも<span className="formHint"> · 前回来店から{alert.daysSinceLastVisit}日</span></span></Link>)}</section>}

    <div className="row"><div className="sectionTitle">本日の予定</div><Link className="subtle" href="/schedule">すべて見る ›</Link></div>
    <section className="card stack">{todayVisitors.map(entry=>{const customerId=entry.customerId!;const customer=customerById.get(customerId);const memory=memoryByCustomer.get(customerId);const name=customer?.displayName??memory?.displayNameSnapshot??"お客様";const nextTopics=visibleNextTopics(memory?.nextTopicHint,1);return <div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><Link className="timelineTitle" href={`/people/${customerId}`}>{name}さん</Link><div className="formHint">来店予定{nextTopics[0]?` · 次に話す：${nextTopics[0]}`:""}</div><form action={startHomeVisitAction.bind(null,customerId,entry.visitScheduleId)}><button className="secondaryButton compactButton compactForm" type="submit">接客開始</button></form></div></div>})}{otherToday.map(entry=><div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><div className="timelineTitle">{entry.title}</div>{entry.note&&<div className="formHint">{entry.note}</div>}</div></div>)}{todayEntries.length===0&&<div className="empty">今日は予定がありません。ゆっくり整える日にしましょう。</div>}</section>
    <div className="sectionTitle">すぐ使う</div><div className="searchActions"><Link className="secondaryButton actionLink" href="/people">お客様を思い出す</Link><Link className="primaryButton actionLink" href="/capture">接客を残す</Link></div>
    <BottomNav />
  </main>;
}
