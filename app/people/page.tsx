import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listNextActions } from "@/lib/professional-next-action-repository";
import { listProfessionalTimeline, listLatestConversationsByCustomer } from "@/lib/professional-timeline-repository";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";
import { getOwnerPreferences } from "@/lib/owner-preferences";
import { buildSoonVisitAlert } from "@/lib/soon-alerts";

type PeopleSort = "name" | "recent_visit" | "visit_count" | "soon" | "due_followup" | "open_followup";
const sortLabels: Record<PeopleSort, string> = { name: "名前順", recent_visit: "直近の来店順", visit_count: "来店履歴が多い順", soon: "そろそろ順", due_followup: "期限付きフォローが近い順", open_followup: "未対応フォローあり順" };
const sortValues: PeopleSort[] = ["name", "recent_visit", "visit_count", "soon", "due_followup", "open_followup"];
const proSortValues = new Set<PeopleSort>(["soon", "due_followup", "open_followup"]);
const FAR_FUTURE = "9999-12-31T23:59:59.999Z";

function dueRank(value?: string) {
  if (!value) return FAR_FUTURE;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : FAR_FUTURE;
}

export default async function PeoplePage({searchParams}:{searchParams:Promise<{q?:string;sort?:string}>}) {
  const {q="",sort="name"}=await searchParams;
  const requestedSort:PeopleSort=sortValues.includes(sort as PeopleSort)?sort as PeopleSort:"name";
  const query=q.trim().toLowerCase();
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity();
  const [customers,memories,access,preferences]=await Promise.all([listGrowthCustomers(workspaceId,userId),listCustomerMemories(workspaceId,userId),getPlanAccess(ownerUserId),getOwnerPreferences(ownerUserId)]);
  const proDiscoveryAllowed = hasVelvetFeature(access,"followup.manage");
  const selectedSort:PeopleSort=proSortValues.has(requestedSort)&&!proDiscoveryAllowed?"name":requestedSort;
  const memoryByCustomer=new Map(memories.map(m=>[m.customerId,m]));
  const customerById=new Map(customers.map(c=>[c.customerId,c]));
  const ids=[...new Set([...customers.map(c=>c.customerId),...memories.map(m=>m.customerId)])];
  const [latest,timelines,nextActionPairs]=await Promise.all([
    listLatestConversationsByCustomer(workspaceId,userId,ids),
    Promise.all(ids.map(async id=>[id,await listProfessionalTimeline(workspaceId,userId,id)] as const)),
    proDiscoveryAllowed?Promise.all(ids.map(async id=>[id,await listNextActions(workspaceId,userId,id)] as const)):Promise.resolve([] as Array<readonly [string, Awaited<ReturnType<typeof listNextActions>>]>),
  ]);
  const timelineByCustomer=new Map(timelines);
  const nextByCustomer=new Map(nextActionPairs);
  const rows=ids.map(customerId=>{
    const customer=customerById.get(customerId),memory=memoryByCustomer.get(customerId),conversation=latest.get(customerId),timeline=timelineByCustomer.get(customerId)??[];
    const visits=timeline.filter(item=>item.eventType==="visit");
    const latestVisit=visits[0]?.occurredAt??"";
    const nextActions=nextByCustomer.get(customerId)??[];
    const openNext=nextActions.filter(action=>action.status==="open");
    const soonAlert=access.soonAlertsAllowed&&preferences.soonAlertsEnabled?buildSoonVisitAlert(customerId,timeline):undefined;
    return{
      customerId,
      displayName:customer?.displayName??memory?.displayNameSnapshot??"お客様",
      tags:memory?.tags??[],
      visitCount:visits.length,
      latestVisit,
      openFollowupCount:openNext.length,
      nextDueAt:openNext.map(action=>dueRank(action.dueAt)).sort()[0]??FAR_FUTURE,
      soonScore:soonAlert?(soonAlert.overdueDays*1000+soonAlert.daysSinceLastVisit):0,
      soonLabel:soonAlert?`そろそろ · 前回から${soonAlert.daysSinceLastVisit}日`:"",
      memoryText:[memory?.personalityNote,memory?.preferenceNote,memory?.cautionNote,memory?.conversationSummary,memory?.lastInteractionSummary,memory?.nextTopicHint,conversation?.body,conversation?.title].filter(Boolean).join(" "),
    };
  });
  function compare(a:typeof rows[number],b:typeof rows[number]){
    if(selectedSort==="recent_visit")return b.latestVisit.localeCompare(a.latestVisit)||a.displayName.localeCompare(b.displayName,"ja");
    if(selectedSort==="visit_count")return b.visitCount-a.visitCount||b.latestVisit.localeCompare(a.latestVisit)||a.displayName.localeCompare(b.displayName,"ja");
    if(selectedSort==="soon")return b.soonScore-a.soonScore||b.latestVisit.localeCompare(a.latestVisit)||a.displayName.localeCompare(b.displayName,"ja");
    if(selectedSort==="due_followup")return a.nextDueAt.localeCompare(b.nextDueAt)||b.openFollowupCount-a.openFollowupCount||a.displayName.localeCompare(b.displayName,"ja");
    if(selectedSort==="open_followup")return b.openFollowupCount-a.openFollowupCount||a.nextDueAt.localeCompare(b.nextDueAt)||a.displayName.localeCompare(b.displayName,"ja");
    return a.displayName.localeCompare(b.displayName,"ja");
  }
  const filtered=(query?rows.filter(row=>[row.displayName,...row.tags,row.memoryText].join(" ").toLowerCase().includes(query)):rows).sort(compare);
  return <main className="shell"><header className="header"><div className="brand">お客様</div><Link className="subtle" href="/add">＋ 追加</Link></header><form action="/people" method="get" className="stack"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・前回の話など" autoComplete="off"/><label className="fieldLabel" htmlFor="sort">並び替え</label><select className="selectBox" id="sort" name="sort" defaultValue={selectedSort}>{sortValues.map(value=><option value={value} key={value} disabled={proSortValues.has(value)&&!proDiscoveryAllowed}>{sortLabels[value]}{proSortValues.has(value)?" · Pro":""}</option>)}</select>{proSortValues.has(requestedSort)&&!proDiscoveryAllowed&&<div className="formHint">そろそろ順・フォロー順はProで利用できます。</div>}<button className="secondaryButton" type="submit">検索・並び替え</button></form><div className="row"><div className="sectionTitle">{query?`${filtered.length}件見つかりました`:`${filtered.length}人`}</div><Link className="subtle" href="/search?q=%E3%82%B4%E3%83%AB%E3%83%95&natural=1">詳しく探す ›</Link></div>{!query&&<div className="card noticeCard"><div className="formHint">名前を忘れても大丈夫</div><div className="timelineBody">名前・特徴・趣味・前回の話など、覚えている情報で探せます。</div><Link className="secondaryButton actionLink compactForm" href="/search?q=%E3%82%B4%E3%83%AB%E3%83%95">詳しく探す</Link></div>}<div className="stack">{filtered.map(row=><Link className="card personRow customerOpenRow" href={`/people/${row.customerId}`} key={row.customerId}><div className="avatar">{row.displayName.slice(0,1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.tags.length>0&&<div className="personMeta">{row.tags.slice(0,4).join(" · ")}</div>}<div className="formHint">来店 {row.visitCount}件{row.latestVisit?` · 最新 ${row.latestVisit.slice(0,10)}`:""}{row.openFollowupCount>0?` · 未対応${row.openFollowupCount}件`:""}{row.soonLabel?` · ${row.soonLabel}`:""}</div></div><span>›</span></Link>)}{filtered.length===0&&<div className="card empty">該当するお客様はいません</div>}</div><BottomNav/></main>;
}
