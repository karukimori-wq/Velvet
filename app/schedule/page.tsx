import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { createScheduleAction } from "./actions";

const kindLabel={shift:"出勤",visit:"来店",birthday:"誕生日",unavailable:"約束",self_investment:"自分の予定",other:"その他"} as const;
const viewLabel={day:"今日",week:"週間",month:"月間"} as const;
type ScheduleView=keyof typeof viewLabel;
const day=(value:string)=>new Intl.DateTimeFormat("ja-JP",{month:"numeric",day:"numeric",weekday:"short",timeZone:"Asia/Tokyo"}).format(new Date(value));
const time=(value:string)=>new Intl.DateTimeFormat("ja-JP",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Tokyo"}).format(new Date(value));
const tokyoKey=(value:Date|string)=>{const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const get=(type:string)=>parts.find(part=>part.type===type)?.value??"";return `${get("year")}-${get("month")}-${get("day")}`};
const tokyoWeekday=(value:Date|string)=>Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Tokyo",weekday:"short"}).format(new Date(value)).replace(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/,m=>String(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(m))));
const startOfTokyoDay=(key:string)=>new Date(`${key}T00:00:00+09:00`);
function viewRange(view:ScheduleView,now:Date){
  const todayKey=tokyoKey(now);const start=startOfTokyoDay(todayKey);
  if(view==="day") return {start,end:new Date(start.getTime()+24*60*60*1000)};
  if(view==="week"){const weekday=tokyoWeekday(now);const mondayOffset=(weekday+6)%7;start.setUTCDate(start.getUTCDate()-mondayOffset);return {start,end:new Date(start.getTime()+7*24*60*60*1000)}}
  const [year,month]=todayKey.split("-").map(Number);const monthStart=new Date(Date.UTC(year,month-1,1)-9*60*60*1000);return {start:monthStart,end:new Date(Date.UTC(year,month,1)-9*60*60*1000)};
}

export default async function SchedulePage({searchParams}:{searchParams:Promise<{saved?:string;error?:string;view?:string}>}){
 const {saved,error,view:rawView}=await searchParams;const view:ScheduleView=rawView==="week"||rawView==="month"?rawView:"day";const {workspaceId,userId}=await getRequestIdentity();const [entries,customers]=await Promise.all([listScheduleEntries(workspaceId,userId),listGrowthCustomers(workspaceId,userId)]);const customerById=new Map(customers.map(c=>[c.customerId,c]));const sorted=[...entries].sort((a,b)=>a.startsAt.localeCompare(b.startsAt));const now=new Date();const range=viewRange(view,now);const visible=sorted.filter(entry=>{const value=new Date(entry.startsAt).getTime();return value>=range.start.getTime()&&value<range.end.getTime()});
 return <main className="shell scheduleShell"><AppHeader title="予定" rightHref="#add-schedule" rightLabel="＋"/>
 <div className="scheduleIntro"><strong>{viewLabel[view]}の予定を確認する</strong><small>来店・誕生日・約束・イベントをまとめて確認できます。</small></div><div className="scheduleLegend"><span>来店</span><span>誕生日</span><span>約束</span><span>その他</span></div>
 <div className="filterRow scheduleViewTabs" aria-label="予定の表示切り替え"><Link className={`filterPill${view==="day"?" filterActive":""}`} href="/schedule?view=day">今日</Link><Link className={`filterPill${view==="week"?" filterActive":""}`} href="/schedule?view=week">週間</Link><Link className={`filterPill${view==="month"?" filterActive":""}`} href="/schedule?view=month">月間</Link></div>
 {saved&&<div className="card successCard compactForm">✓ 予定を追加しました</div>}{error==="customer"&&<div className="formError">来店予定は、お客様を選んでください。</div>}{error==="datetime"&&<div className="formError">日時を選んでください。</div>}
 <div className="sectionHeading"><div><div className="sectionTitle">{viewLabel[view]}の予定</div></div><span className="scheduleCount">{visible.length}件</span></div>
 {visible.length>0?<div className="scheduleList">{visible.map(entry=>{const customer=entry.customerId?customerById.get(entry.customerId):undefined;return <article className={`card scheduleEntry schedule-${entry.kind}`} key={entry.id}><div className="scheduleDateBlock"><strong>{day(entry.startsAt)}</strong><span>{time(entry.startsAt)}</span></div><span className="scheduleEntryRail"/><div className="scheduleEntryMain"><div className="row"><div className="timelineTitle">{entry.title}</div><span className="chip">{kindLabel[entry.kind]}</span></div>{entry.customerId&&<Link className="scheduleCustomer scheduleCustomerLink" href={`/people/${entry.customerId}`}>{customer?.displayName??"お客様"}さん <span>›</span></Link>}{entry.note&&<div className="formHint">{entry.note}</div>}</div></article>})}</div>:<div className="card empty scheduleEmpty"><span>♢</span><strong>{viewLabel[view]}の予定はありません</strong><small>右上の＋から、次に会う日や大切な予定を追加できます。</small></div>}
 <details className="detailsCard scheduleAddCard" id="add-schedule" open={sorted.length===0||Boolean(error)}><summary>＋ 予定を追加</summary><form action={createScheduleAction} className="stack scheduleForm detailsBody"><div className="scheduleFormLead"><strong>何の予定ですか？</strong><small>来店ならお客様も一緒に選べます。誕生日もここから登録できます。</small></div><div className="chips choiceRow">{(["visit","shift","birthday","unavailable","self_investment","other"] as const).map(kind=><label className="choiceChip" key={kind}><input type="radio" name="kind" value={kind} defaultChecked={kind==="visit"}/>{kindLabel[kind]}</label>)}</div>{customers.length>0&&<select className="selectBox" name="customerId" defaultValue=""><option value="">お客様を選ぶ（来店・誕生日の時）</option>{customers.map(customer=><option key={customer.customerId} value={customer.customerId}>{customer.displayName}</option>)}</select>}<label className="fieldLabel" htmlFor="startsAt">日時</label><input id="startsAt" className="searchBox scheduleDateTime" name="startsAt" type="datetime-local"/><input className="searchBox" name="title" placeholder="内容（空欄でもOK）" autoComplete="off"/><input className="searchBox" name="note" placeholder="その日に覚えておきたいこと" autoComplete="off"/><button className="primaryButton" type="submit">この予定を追加</button></form></details><BottomNav/></main>;
}
