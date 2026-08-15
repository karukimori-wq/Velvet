import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getProfessionalVisit } from "@/lib/professional-visit-repository";
import { visibleNextTopics } from "@/lib/next-topic";
import { endVisitAction, quickUpdateVisitAction, updateVisitAction } from "../actions";

const seatingChoices=["新規","指名","場内指名","ヘルプ","同伴","フリー"];

export default async function ActiveVisitPage({params}:{params:Promise<{visitId:string}>}){
  const {visitId}=await params; const identity=await getRequestIdentity(); const visit=await getProfessionalVisit(visitId,identity.workspaceId,identity.userId); if(!visit)notFound();
  const [customer,memory]=await Promise.all([getGrowthCustomerDisplay({workspaceId:identity.workspaceId,userId:identity.userId,customerId:visit.customerId,reservationId:visit.reservationId,visitScheduleId:visit.visitScheduleId}),getCustomerMemory(identity.workspaceId,identity.userId,visit.customerId)]);
  const start=new Date(visit.visitedAt); const elapsedMinutes=visit.endedAt?visit.durationMinutes??0:Math.max(0,Math.floor((Date.now()-start.getTime())/60000)); const name=customer.displayName||memory?.displayNameSnapshot||"お客様"; const nextTopics=visibleNextTopics(memory?.nextTopicHint,2);
  const recall=[memory?.cautionNote&&{label:"注意",value:memory.cautionNote},memory?.lastInteractionSummary&&{label:"前回",value:memory.lastInteractionSummary},memory?.preferenceNote&&{label:"好み",value:memory.preferenceNote}].filter(Boolean) as Array<{label:string;value:string}>;
  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${visit.customerId}`}>‹ {name}</Link><span className="subtle">接客中</span></header>
    <section className="hero"><h1>{name}</h1><p>{start.toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})}〜 · {elapsedMinutes}分</p></section>
    {recall.length>0&&<section><div className="sectionTitle">さっと確認</div><div className="card stack">{recall.map(item=><div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}{nextTopics.length>0&&<div><div className="formHint">次に話すこと</div>{nextTopics.map(topic=><div className="timelineBody" key={topic}>・{topic}</div>)}</div>}</div></section>}
    {!visit.endedAt&&<>
      <div className="sectionTitle">着席理由</div><div className="chips choiceRow">{seatingChoices.map(value=><form action={quickUpdateVisitAction.bind(null,visit.id,"seatingReason",value)} key={value}><button className={`choiceChip ${visit.seatingReason===value?"activeAction":""}`} type="submit">{value}</button></form>)}</div>
      <details className="detailsCard"><summary>接客中にメモを残す</summary><form action={updateVisitAction} className="stack detailsBody"><input type="hidden" name="visitId" value={visit.id}/><textarea className="searchBox" name="conversationMemo" placeholder="今話したこと" defaultValue={visit.conversationMemo??""}/><textarea className="searchBox" name="preferenceMemo" placeholder="新しく分かった好み" defaultValue={visit.preferenceMemo??""}/><textarea className="searchBox" name="cautionMemo" placeholder="覚えておきたい注意点" defaultValue={visit.cautionMemo??""}/><textarea className="searchBox" name="nextActionMemo" placeholder="次に聞きたいこと" defaultValue={visit.nextActionMemo??""}/><button className="secondaryButton" type="submit">メモを保存</button></form></details>
      <div className="sectionTitle">接客が終わったら</div><form action={endVisitAction}><input type="hidden" name="visitId" value={visit.id}/><button className="primaryButton" type="submit">接客終了 → 今日の会話を残す</button></form>
    </>}
    {visit.endedAt&&<div className="card stack"><strong>接客終了</strong><div className="timelineBody">{visit.durationMinutes??0}分</div><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(visit.customerId)}&fromVisit=${encodeURIComponent(visit.id)}`}>今日の会話を残す</Link></div>}
    <BottomNav />
  </main>;
}
