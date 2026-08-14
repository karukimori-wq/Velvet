import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { CaptureVoiceInput } from "@/components/capture-voice-input";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer, listGrowthCustomers } from "@/lib/growth-engine-customer";
import { getCaptureSuggestions } from "@/lib/capture-repository";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { listProfessionalTimeline } from "@/lib/professional-timeline-repository";
import { quickCaptureAction } from "./actions";
import { organizeCaptureAction } from "./organize/actions";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ customerId?: string; saved?: string; error?: string; fromVisit?: string }> }) {
  const { customerId, saved, error, fromVisit } = await searchParams;
  const { workspaceId, userId } = await getRequestIdentity();
  if (!customerId) {
    const customers=await listGrowthCustomers(workspaceId,userId);
    return <main className="shell"><header className="header"><Link className="subtle" href="/add">‹ 戻る</Link><div className="brand">今日の接客</div></header><section className="hero"><h1>誰との話を残しますか？</h1><p>お客様を選ぶと、前回の話を確認してすぐ記録できます。</p></section><div className="stack">{customers.map(c=>{const name=c.displayName??"お客様";return <Link className="card personRow" href={`/capture?customerId=${encodeURIComponent(c.customerId)}`} key={c.customerId}><div className="avatar">{name.slice(0,1)}</div><div className="personMain"><div className="personName">{name}</div></div><span>›</span></Link>})}{customers.length===0&&<div className="card empty">登録済みのお客様がいません</div>}</div><BottomNav /></main>;
  }

  const [customer,suggestions,memory,timeline]=await Promise.all([
    getGrowthCustomer(workspaceId,userId,customerId),
    getCaptureSuggestions(workspaceId,userId,customerId,18),
    getCustomerMemory(workspaceId,userId,customerId),
    listProfessionalTimeline(workspaceId,userId,customerId),
  ]);
  const displayName=customer?.displayName??"お客様";
  const quick=suggestions.filter(i=>i.source!=="default").slice(0,8);
  const lastConversation=timeline.find(item=>item.eventType==="conversation");
  const recall=[
    memory?.cautionNote&&{label:"注意",value:memory.cautionNote},
    memory?.lastInteractionSummary&&{label:"前回",value:memory.lastInteractionSummary},
    lastConversation?.body&&{label:"最後に話したこと",value:lastConversation.body},
    memory?.nextTopicHint&&{label:"次に話すこと",value:memory.nextTopicHint},
  ].filter(Boolean) as Array<{label:string;value:string}>;

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/capture">‹ お客様を選ぶ</Link><span className="subtle">{displayName}</span></header>
    <section className="hero"><h1>{fromVisit?"退店後に、覚えているうちに。":"今日の接客を残す"}</h1><p>{fromVisit?"忘れる前に、話したことをそのまま残します。":"前回をさっと確認して、今日の話をそのまま残せます。"}</p></section>
    {recall.length>0&&<section><div className="sectionTitle">前回を思い出す</div><div className="card stack">{recall.map(item=><div key={item.label}><div className="formHint">{item.label}</div><div>{item.value}</div></div>)}</div></section>}
    {saved&&<div className="card successCard"><div className="formHint">登録した内容</div><strong>{saved}</strong></div>}
    {error&&<div className="formError">入力内容を確認してください。</div>}
    <div className="sectionTitle">今日話したこと</div>
    <form action={organizeCaptureAction.bind(null,customerId,fromVisit)} className="stack"><CaptureVoiceInput placeholder="例：娘が来月受験。大阪出張。最近は白州が好き。"/><button className="primaryButton" type="submit">整理して確認</button></form>
    {quick.length>0&&<><div className="sectionTitle">すぐ追加</div><div className="chips">{quick.map(item=><form action={quickCaptureAction.bind(null,customerId,"knowledge",item.value,fromVisit)} key={item.value}><button className="chip chipButton" type="submit">{item.value}</button></form>)}</div></>}
    <div className="sectionTitle">この人について追加する</div><Link className="secondaryButton actionLink" href={`/remember?customerId=${encodeURIComponent(customerId)}`}>外見・好み・仕事などを追加</Link>
    <BottomNav />
  </main>;
}
