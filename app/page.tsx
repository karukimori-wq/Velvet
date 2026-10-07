import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { VelvetIcon } from "@/components/velvet-icon";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomersWithStatus } from "@/lib/growth-engine-customer";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { visibleNextTopics } from "@/lib/next-topic";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";
import { getOwnerPreferences } from "@/lib/owner-preferences";
import { listVisitTimelinesByCustomer } from "@/lib/professional-timeline-repository";
import { countDueNextActions, listDueNextActions } from "@/lib/professional-next-action-repository";
import { buildSoonVisitAlert, sortSoonVisitAlerts, type SoonVisitAlert } from "@/lib/soon-alerts";
import { startHomeVisitAction } from "./home-actions";

const tokyoDate=(value:Date|string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
const tokyoTime=(value:string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
const isSoonAlert=(value:SoonVisitAlert|undefined):value is SoonVisitAlert=>Boolean(value);

export default async function HomePage(){
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity();
  const [customerResult,memories,schedule,access,preferences]=await Promise.all([listGrowthCustomersWithStatus(workspaceId,userId),listCustomerMemories(workspaceId,userId),listScheduleEntries(workspaceId,userId),getPlanAccess(ownerUserId),getOwnerPreferences(ownerUserId)]); const customers=customerResult.customers;
  const customerById=new Map(customers.map(c=>[c.customerId,c])); const memoryByCustomer=new Map(memories.map(m=>[m.customerId,m])); const now=new Date(); const today=tokyoDate(now);
  const todayEntries=schedule.filter(entry=>tokyoDate(entry.startsAt)===today).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
  const nextEntry=todayEntries.find(entry=>new Date(entry.startsAt).getTime()>=now.getTime())??todayEntries[0];
  const allCustomerIds=[...new Set([...customers.map(c=>c.customerId),...memories.map(m=>m.customerId)])];
  const visitByCustomer=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?await listVisitTimelinesByCustomer(workspaceId,userId,allCustomerIds):new Map();
  const allSoonAlerts=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?sortSoonVisitAlerts(allCustomerIds.map(customerId=>buildSoonVisitAlert(customerId,visitByCustomer.get(customerId)??[])).filter(isSoonAlert)):[]; const soonAlerts=allSoonAlerts.slice(0,5);
  const followupAllowed=hasVelvetFeature(access,"followup.manage");
  const followupThrough=new Date(now.getTime()+7*24*60*60*1000);
  const [dueFollowups,dueFollowupCount]=followupAllowed?await Promise.all([listDueNextActions(workspaceId,userId,followupThrough,5),countDueNextActions(workspaceId,userId,followupThrough)]):[[],0];
  const monthKey=today.slice(0,7); const monthEvents=schedule.filter(entry=>tokyoDate(entry.startsAt).startsWith(monthKey)&&entry.kind!=="visit").length;
  const nameFor=(customerId:string)=>customerById.get(customerId)?.displayName??memoryByCustomer.get(customerId)?.displayNameSnapshot??"お客様";
  const nextCustomerId=nextEntry?.kind==="visit"?nextEntry.customerId:undefined;
  const nextCustomer=nextCustomerId?nameFor(nextCustomerId):undefined;
  return <main className="shell homeShell">
    <AppHeader rightHref="/schedule" rightLabel="history" />
    {customerResult.status!=="ok"&&<div className="card noticeCard sourceStatusNotice" role="status"><strong>{customerResult.status==="unconfigured"?"お客様情報の接続を準備中です":"お客様情報を一時的に同期できません"}</strong><div className="formHint">Velvetに保存済みの内容と予定はそのまま使えます。登録が消えたわけではありません。</div></div>}

    <section className="homeNext" aria-label="次にすること">
      <div className="homeNextLabel">次にすること</div>
      {nextEntry&&nextCustomerId&&nextCustomer?<div className="card homeNextCard"><div className="homeNextTime">{tokyoTime(nextEntry.startsAt)}</div><div className="homeNextMain"><Link href={`/people/${nextCustomerId}`}><strong>{nextCustomer}さん</strong></Link><span>来店予定</span></div><form action={startHomeVisitAction.bind(null,nextCustomerId,nextEntry.visitScheduleId)}><button className="primaryButton compactButton" type="submit">接客開始</button></form></div>:nextEntry?<Link className="card homeNextCard homeNextLink" href="/schedule"><div className="homeNextTime">{tokyoTime(nextEntry.startsAt)}</div><div className="homeNextMain"><strong>{nextEntry.title}</strong><span>今日の予定</span></div><span className="homeNextChevron">›</span></Link>:<div className="card homeNextCard homeNextEmpty"><span className="homeNextCheck"><VelvetIcon name="check" /></span><div className="homeNextMain"><strong>今日は予定がありません</strong><span>思い出したい人を探したり、今日のことを覚えておけます。</span></div></div>}
    </section>

    <section className="homeSummaryStrip" aria-label="今日の概要">
      <Link href="/schedule"><span>今日</span><strong>{todayEntries.length}<small>件</small></strong></Link>
      <Link href="/people"><span>お客様</span><strong>{allCustomerIds.length}<small>名</small></strong></Link>
      {followupAllowed?<Link href="/people?sort=due_followup"><span>要フォロー</span><strong>{dueFollowupCount}<small>件</small></strong></Link>:<Link href="/schedule"><span>今月</span><strong>{monthEvents}<small>件</small></strong></Link>}
    </section>

    <section className={`card actionPanel${dueFollowups.length===0&&soonAlerts.length===0?" actionPanelQuiet":""}`}>
      <div className="row"><div><div className="sectionTitle">今、気にしたいこと</div></div><Link href="/people" className="actionMore">お客様を見る ›</Link></div>
      {dueFollowups.slice(0,3).map(item=>{const dueDate=tokyoDate(item.dueAt!);const label=dueDate<today?"期限を過ぎています":dueDate===today?"今日まで":`${dueDate}まで`;return <Link className="actionLine" href={`/people/${item.customerId}/next-actions`} key={item.id}><span className="actionDot">✓</span><span><strong>{nameFor(item.customerId)}さん</strong><span className="actionMeta">{item.text} · {label}</span></span></Link>})}
      {dueFollowups.length===0&&soonAlerts.slice(0,3).map(alert=><Link className="actionLine" href={`/people/${alert.customerId}`} key={alert.customerId}><span className="actionDot">♡</span><span><strong>{nameFor(alert.customerId)}さん</strong><span className="actionMeta">そろそろかも · 前回来店から{alert.daysSinceLastVisit}日</span></span></Link>)}
      {dueFollowups.length===0&&soonAlerts.length===0&&<div className="actionEmpty"><span><VelvetIcon name="check" /></span><div><strong>急ぎのフォローはありません</strong><small>必要なときに、お客様を思い出せます。</small></div></div>}
    </section>

    <div className="sectionHeading"><div><div className="sectionTitle">今日の予定</div></div><Link className="subtle" href="/schedule">すべて見る ›</Link></div>
    <section className="card stack scheduleCard">{todayEntries.map(entry=>{if(entry.kind==="visit"&&entry.customerId){const customerId=entry.customerId;const customer=customerById.get(customerId);const memory=memoryByCustomer.get(customerId);const name=customer?.displayName??memory?.displayNameSnapshot??"お客様";const nextTopics=visibleNextTopics(memory?.nextTopicHint,1);return <div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><Link className="timelineTitle" href={`/people/${customerId}`}>{name}さん</Link><div className="formHint">来店予定{nextTopics[0]?` · 次に話す：${nextTopics[0]}`:""}</div></div></div>;}return <div className="scheduleLine" key={entry.id}><time>{tokyoTime(entry.startsAt)}</time><span className="scheduleRail"/><div><div className="timelineTitle">{entry.title}</div>{entry.note&&<div className="formHint">{entry.note}</div>}</div></div>;})}{todayEntries.length===0&&<div className="empty homeEmpty"><span><VelvetIcon name="calendar" /></span><strong>予定はありません</strong><small>下の「覚える」から今日のことを残せます。</small></div>}</section>
    <BottomNav />
  </main>;
}