import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listLatestConversationsByCustomer } from "@/lib/professional-timeline-repository";
import { parseNextTopics } from "@/lib/next-topics";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const query = q.trim().toLowerCase();
  const { workspaceId, userId } = await getRequestIdentity();
  const [customers, memories] = await Promise.all([listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId)]);
  const memoryByCustomer = new Map(memories.map((memory) => [memory.customerId, memory])); const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const latestConversations = await listLatestConversationsByCustomer(workspaceId, userId, [...ids]);
  const rows = [...ids].map((customerId) => { const customer=customerById.get(customerId); const memory=memoryByCustomer.get(customerId); const latestConversation=latestConversations.get(customerId); return { customerId, displayName:customer?.displayName??memory?.displayNameSnapshot??"お客様", tags:memory?.tags??[], pinned:memory?.pinned??false, personalityNote:memory?.personalityNote, preferenceNote:memory?.preferenceNote, cautionNote:memory?.cautionNote, lastInteractionSummary:memory?.lastInteractionSummary, nextTopics:parseNextTopics(memory?.nextTopicHint).slice(0,3), latestConversation:latestConversation?.body??latestConversation?.title, memoryText:[memory?.personalityNote,memory?.preferenceNote,memory?.cautionNote,memory?.conversationSummary,memory?.lastInteractionSummary,memory?.nextTopicHint,latestConversation?.body,latestConversation?.title].filter(Boolean).join(" ") }; }).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||a.displayName.localeCompare(b.displayName,"ja"));
  const filtered=query?rows.filter((row)=>[row.displayName,...row.tags,row.memoryText].join(" ").toLowerCase().includes(query)):rows;
  return <main className="shell">
    <header className="header"><div className="brand">お客様</div><Link className="subtle" href="/add">＋ 追加</Link></header>
    <form action="/people" method="get"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・前回の話など" autoComplete="off" /></form>
    <div className="row"><div className="sectionTitle">{query?`${filtered.length}件見つかりました`:`${filtered.length}人`}</div><Link className="subtle" href="/search?q=%E3%82%B4%E3%83%AB%E3%83%95&natural=1">文章で探す ›</Link></div>
    {!query&&<div className="card noticeCard"><div className="formHint">名前を忘れても大丈夫</div><div className="timelineBody">「ゴルフが好きでロレックスの人」のような覚えている情報でも探せます。</div><Link className="secondaryButton actionLink compactForm" href="/search?q=%E3%82%B4%E3%83%AB%E3%83%95%E3%81%8C%E5%A5%BD%E3%81%8D%E3%81%A7%E3%83%AD%E3%83%AC%E3%83%83%E3%82%AF%E3%82%B9%E3%81%AE%E4%BA%BA&natural=1">文章でお客様を探す</Link></div>}
    <div className="stack">{filtered.map((row)=>{const quickItems=[row.cautionNote&&{label:"注意",value:row.cautionNote},row.lastInteractionSummary&&{label:"前回",value:row.lastInteractionSummary},!row.lastInteractionSummary&&row.latestConversation&&{label:"最後に話したこと",value:row.latestConversation},row.nextTopics.length&&{label:"次に話すこと",value:row.nextTopics.join(" ・ ")},row.preferenceNote&&{label:"好み",value:row.preferenceNote},row.personalityNote&&{label:"人柄",value:row.personalityNote}].filter(Boolean) as Array<{label:string;value:string}>;return <details className="card" key={row.customerId}><summary className="personRow"><div className="avatar">{row.displayName.slice(0,1)}</div><div className="personMain"><div className="personName">{row.pinned?"★ ":""}{row.displayName}</div>{row.tags.length>0&&<div className="personMeta">{row.tags.slice(0,4).join(" · ")}</div>}</div><span>{quickItems.length?"確認":"›"}</span></summary><div className="detailsBody stack">{quickItems.map((item)=><div key={`${item.label}-${item.value}`}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}<div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${row.customerId}`}>詳しく見る</Link><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(row.customerId)}`}>今日の接客</Link></div></div></details>})}{filtered.length===0&&<div className="card empty">該当するお客様はいません</div>}</div>
    <BottomNav />
  </main>;
}
