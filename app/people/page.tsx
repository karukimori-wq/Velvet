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
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const latestConversations = await listLatestConversationsByCustomer(workspaceId, userId, [...ids]);
  const rows = [...ids].map((customerId) => {
    const customer = customers.find((item) => item.customerId === customerId);
    const memory = memoryByCustomer.get(customerId);
    const latestConversation = latestConversations.get(customerId);
    return {
      customerId,
      displayName: customer?.displayName ?? memory?.displayNameSnapshot ?? `Customer ${customerId}`,
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
  const filtered = query ? rows.filter((row) => [row.displayName, row.customerId, ...row.tags, row.memoryText].join(" ").toLowerCase().includes(query)) : rows;

  return <main className="shell">
    <header className="header"><div className="brand">People</div><Link className="subtle" href="/people/new">顧客追加について</Link></header>
    <form action="/people" method="get"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・ブランドなど" autoComplete="off" /></form>
    <div className="sectionTitle">{query ? `${filtered.length}件` : "すべて"}</div>
    <div className="stack">
      {filtered.map((row) => {
        const quickItems = [
          row.cautionNote ? `注意 · ${row.cautionNote}` : undefined,
          row.lastInteractionSummary ? `前回 · ${row.lastInteractionSummary}` : undefined,
          row.latestConversation ? `最後の会話 · ${row.latestConversation}` : undefined,
          row.nextTopicHint ? `次回 · ${row.nextTopicHint}` : undefined,
          row.preferenceNote ? `好み · ${row.preferenceNote}` : undefined,
          row.personalityNote ? `人柄 · ${row.personalityNote}` : undefined,
        ].filter(Boolean) as string[];
        return <details className="card" key={row.customerId}>
          <summary className="personRow">
            <div className="avatar">{row.displayName.slice(0, 1)}</div>
            <div className="personMain"><div className="personName">{row.pinned ? "★ " : ""}{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 5).join(" · ")}</div>}</div><span>{quickItems.length ? "見る" : "›"}</span>
          </summary>
          <div className="detailsBody stack">
            {quickItems.map((item) => <div className="timelineBody" key={item}>{item}</div>)}
            <Link className="secondaryButton actionLink" href={`/people/${row.customerId}`}>詳細を開く</Link>
          </div>
        </details>;
      })}
      {filtered.length === 0 && <div className="card empty">見つかりませんでした</div>}
    </div>
    <BottomNav />
  </main>;
}
