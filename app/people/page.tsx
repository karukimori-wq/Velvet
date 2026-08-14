import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listLatestConversationsByCustomer } from "@/lib/professional-timeline-repository";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const { workspaceId, userId } = await getRequestIdentity();
  const [customers, memories] = await Promise.all([listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId)]);
  const memoryByCustomer = new Map(memories.map((memory) => [memory.customerId, memory]));
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const latestConversations = await listLatestConversationsByCustomer(workspaceId, userId, [...ids]);
  const rows = [...ids].map((customerId) => {
    const customer = customerById.get(customerId);
    const memory = memoryByCustomer.get(customerId);
    const latestConversation = latestConversations.get(customerId);
    return {
      customerId,
      displayName: customer?.displayName ?? memory?.displayNameSnapshot ?? "お客様",
      tags: memory?.tags ?? [],
      pinned: memory?.pinned ?? false,
      personalityNote: memory?.personalityNote,
      preferenceNote: memory?.preferenceNote,
      cautionNote: memory?.cautionNote,
      lastInteractionSummary: memory?.lastInteractionSummary,
      nextTopicHint: memory?.nextTopicHint,
      latestConversation: latestConversation?.body ?? latestConversation?.title,
      memoryText: [memory?.personalityNote, memory?.preferenceNote, memory?.cautionNote, memory?.conversationSummary, memory?.lastInteractionSummary, memory?.nextTopicHint, latestConversation?.body, latestConversation?.title].filter(Boolean).join(" "),
    };
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.displayName.localeCompare(b.displayName, "ja"));
  const filtered = query ? rows.filter((row) => [row.displayName, ...row.tags, row.memoryText].join(" ").toLowerCase().includes(query)) : rows;

  return <main className="shell">
    <header className="header"><div className="brand">お客様</div><Link className="subtle" href="/add">＋ 追加</Link></header>
    <form action="/people" method="get"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・前回の話など" autoComplete="off" /></form>
    <div className="sectionTitle">{query ? `${filtered.length}件見つかりました` : `${filtered.length}人`}</div>
    <div className="stack">
      {filtered.map((row) => {
        const quickItems = [
          row.cautionNote ? { label: "注意", value: row.cautionNote } : undefined,
          row.lastInteractionSummary ? { label: "前回", value: row.lastInteractionSummary } : undefined,
          !row.lastInteractionSummary && row.latestConversation ? { label: "最後に話したこと", value: row.latestConversation } : undefined,
          row.nextTopicHint ? { label: "次に話すこと", value: row.nextTopicHint } : undefined,
          row.preferenceNote ? { label: "好み", value: row.preferenceNote } : undefined,
          row.personalityNote ? { label: "人柄", value: row.personalityNote } : undefined,
        ].filter(Boolean) as Array<{label:string; value:string}>;
        return <details className="card" key={row.customerId}>
          <summary className="personRow">
            <div className="avatar">{row.displayName.slice(0, 1)}</div>
            <div className="personMain"><div className="personName">{row.pinned ? "★ " : ""}{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 4).join(" · ")}</div>}</div><span>{quickItems.length ? "確認" : "›"}</span>
          </summary>
          <div className="detailsBody stack">
            {quickItems.map((item) => <div key={`${item.label}-${item.value}`}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}
            <div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${row.customerId}`}>詳しく見る</Link><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(row.customerId)}`}>今日の接客</Link></div>
          </div>
        </details>;
      })}
      {filtered.length === 0 && <div className="card empty">該当するお客様はいません</div>}
    </div>
    <BottomNav />
  </main>;
}
