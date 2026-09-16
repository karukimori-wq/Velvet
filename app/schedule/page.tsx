import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { createScheduleAction } from "./actions";

const kindLabel={shift:"出勤",visit:"来店",birthday:"誕生日",unavailable:"約束",self_investment:"自分の予定",other:"その他"} as const;
const day=(value:string)=>new Intl.DateTimeFormat("ja-JP",{month:"numeric",day:"numeric",weekday:"short",timeZone:"Asia/Tokyo"}).format(new Date(value));
const time=(value:string)=>new Intl.DateTimeFormat("ja-JP",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Tokyo"}).format(new Date(value));

export default async function SchedulePage({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}){
 const {saved,error}=await searchParams;const {workspaceId,userId}=await getRequestIdentity();const [entries,customers]=await Promise.all([listScheduleEntries(workspaceId,userId),listGrowthCustomers(workspaceId,userId)]);const customerById=new Map(customers.map(c=>[c.customerId,c]));const sorted=[...entries].sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
 return <main className="shell scheduleShell"><AppHeader title="予定" rightHref="#add-schedule" rightLabel="＋"/>
 <div className="scheduleIntro"><strong>次に会う日を、忘れない。</strong><small>来店・誕生日・約束をまとめて確認できます。</small></div><div className="scheduleLegend"><span>来店</span><span>誕生日</span><span>約束</span><span>その他</span></div>
 {saved&&<div className="card successCard compactForm">✓ 予定を追加しました</div>}{error==="customer"&&<div className="formError">来店予定は、お客様を選んでください。</div>}{error==="datetime"&&<div className="formError">日時を選んでください。</div>}
 <div className="sectionHeading"><div><div className="sectionTitle">予定一覧</div></div><span className="scheduleCount">{sorted.length}件</span></div>
 {sorted.length>0?<div className="scheduleList">{sorted.map(entry=>{const customer=entry.customerId?customerById.get(entry.customerId):undefined;return <article className={`card scheduleEntry schedule-${entry.kind}`} key={entry.id}><div className="scheduleDateBlock"><strong>{day(entry.startsAt)}</strong><span>{time(entry.startsAt)}</span></div><span className="scheduleEntryRail"/><div className="scheduleEntryMain"><div className="row"><div className="timelineTitle">{entry.title}</div><span className="chip">{kindLabel[entry.kind]}</span></div>{entry.customerId&&<Link className="scheduleCustomer scheduleCustomerLink" href={`/people/${entry.customerId}`}>{customer?.displayName??"お客様"}さん <span>›</span></Link>}{entry.note&&<div className="formHint">{entry.note}</div>}</div></article>})}</div>:<div className="card empty scheduleEmpty"><span>♢</span><strong>予定はまだありません</strong><small>右上の＋から、次に会う日や大切な予定を追加できます。</small></div>}
 <details className="detailsCard scheduleAddCard" id="add-schedule" open={sorted.length===0||Boolean(error)}><summary>＋ 予定を追加</summary><form action={createScheduleAction} className="stack scheduleForm detailsBody"><div className="scheduleFormLead"><strong>何の予定ですか？</strong><small>来店ならお客様も一緒に選べます。</small></div><div className="chips choiceRow">{(["visit","shift","birthday","unavailable","self_investment","other"] as const).map(kind=><label className="choiceChip" key={kind}><input type="radio" name="kind" value={kind} defaultChecked={kind==="visit"}/>{kindLabel[kind]}</label>)}</div>{customers.length>0&&<select className="selectBox" name="customerId" defaultValue=""><option value="">お客様を選ぶ（来店の時）</option>{customers.map(customer=><option key={customer.customerId} value={customer.customerId}>{customer.displayName}</option>)}</select>}<label className="fieldLabel" htmlFor="startsAt">日時</label><input id="startsAt" className="searchBox scheduleDateTime" name="startsAt" type="datetime-local"/><input className="searchBox" name="title" placeholder="内容（空欄でもOK）" autoComplete="off"/><input className="searchBox" name="note" placeholder="その日に覚えておきたいこと" autoComplete="off"/><button className="primaryButton" type="submit">この予定を追加</button></form></details><BottomNav/></main>;
}
