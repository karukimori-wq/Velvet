import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const { workspaceId, userId } = await getRequestIdentity();
  const [customers, memories] = await Promise.all([listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId)]);
  const memoryByCustomer = new Map(memories.map((memory) => [memory.customerId, memory]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const rows = [...ids].map((customerId) => {
    const customer = customers.find((item) => item.customerId === customerId);
    const memory = memoryByCustomer.get(customerId);
    return {
      customerId,
      displayName: customer?.displayName ?? memory?.displayNameSnapshot ?? `Customer ${customerId}`,
      tags: memory?.tags ?? [],
      pinned: memory?.pinned ?? false,
      memoryText: [memory?.personalityNote, memory?.preferenceNote, memory?.cautionNote, memory?.conversationSummary].filter(Boolean).join(" "),
    };
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.displayName.localeCompare(b.displayName, "ja"));
  const filtered = query ? rows.filter((row) => [row.displayName, row.customerId, ...row.tags, row.memoryText].join(" ").toLowerCase().includes(query)) : rows;

  return <main className="shell">
    <header className="header"><div className="brand">People</div><Link className="subtle" href="/people/new">顧客追加について</Link></header>
    <form action="/people" method="get"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・ブランドなど" autoComplete="off" /></form>
    <div className="sectionTitle">{query ? `${filtered.length}件` : "すべて"}</div>
    <div className="stack">
      {filtered.map((row) => <Link className="card personRow" href={`/people/${row.customerId}`} key={row.customerId}>
        <div className="avatar">{row.displayName.slice(0, 1)}</div>
        <div className="personMain"><div className="personName">{row.pinned ? "★ " : ""}{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 5).join(" · ")}</div>}</div><span>›</span>
      </Link>)}
      {filtered.length === 0 && <div className="card empty">見つかりませんでした</div>}
    </div>
    <BottomNav />
  </main>;
}
