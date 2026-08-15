import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { visibleNextTopics } from "@/lib/next-topic";
import { startHomeVisitAction } from "./home-actions";

const tokyoDate=(value:Date|string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
const tokyoTime=(value:string)=>new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit"}).format(new Date(value));

export default async function HomePage(){
  const {workspaceId,userId}=await getRequestIdentity();
  const [customers,memories,schedule]=await Promise.all([listGrowthCustomers(workspaceId,userId),listCustomerMemories(workspaceId,userId),listScheduleEntries(workspaceId,userId)]);
  const customerById=new Map(customers.map(c=>[c.customerId,c])); const memoryByCustomer=new Map(memories.map(m=>[m.customerId,m])); const today=tokyoDate(new Date());
  const todayEntries=schedule.filter(entry=>tokyoDate(entry.startsAt)===today); const todayVisitors=todayEntries.filter(entry=>entry.kind==="visit"&&entry.customerId).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)); const otherToday=todayEntries.filter(entry=>entry.kind!=="visit").sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
  return <main className="shell">
    <header className="header"><div className="brand">Velvet</div><Link className="subtle" href="/schedule">予定を見る</Link></header>
    <section className="hero"><h1>今日</h1><p>{todayVisitors.length?`今日は${todayVisitors.length}人の来店予定があります。`:`今日の来店予定はありません。`}</p></section>
    <div className="sectionTitle">今日来るお客様</div><div className="stack">{todayVisitors.map(entry=>{const customerId=entry.customerId!;const customer=customerById.get(customerId);const memory=memoryByCustomer.get(customerId);const name=customer?.displayName??memory?.displayNameSnapshot??"お客様";const nextTopics=visibleNextTopics(memory?.nextTopicHint,2);const recall=[memory?.cautionNote&&{label:"注意",value:memory.cautionNote},memory?.lastInteractionSummary&&{label:"前回",value:memory.lastInteractionSummary}].filter(Boolean) as Array<{label:string;value:string}>;return <article className="card stack" key={entry.id}>
      <div className="row"><div><div className="personName">{name}</div><div className="personMeta">{tokyoTime(entry.startsAt)} 来店予定</div></div><div className="avatar">{name.slice(0,1)}</div></div>
      {recall.map(item=><div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}
      {nextTopics.length>0&&<div><div className="formHint">次に話すこと</div>{nextTopics.map(topic=><div className="timelineBody" key={topic}>・{topic}</div>)}</div>}
      <div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${customerId}`}>確認</Link><form action={startHomeVisitAction.bind(null,customerId,entry.visitScheduleId)}><button className="primaryButton" type="submit">接客開始</button></form></div>
    </article>})}{todayVisitors.length===0&&<div className="card empty">予定を追加すると、ここに来店前の確認が表示されます</div>}</div>
    {otherToday.length>0&&<><div className="sectionTitle">そのほかの予定</div><div className="stack">{otherToday.map(entry=><article className="card" key={entry.id}><div className="row"><strong>{entry.title}</strong><span className="subtle">{tokyoTime(entry.startsAt)}</span></div>{entry.note&&<div className="timelineBody">{entry.note}</div>}</article>)}</div></>}
    <div className="sectionTitle">すぐ使う</div><div className="searchActions"><Link className="secondaryButton actionLink" href="/people">お客様を確認</Link><Link className="primaryButton actionLink" href="/capture">今日の接客を残す</Link></div>
    <BottomNav />
  </main>;
}
