import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";

export default async function HomePage() {
  const { workspaceId, userId } = await getRequestIdentity();
  const [customers, memories] = await Promise.all([listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId)]);
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const recent = memories.slice(0, 3).map((memory) => ({
    customerId: memory.customerId,
    displayName: customerById.get(memory.customerId)?.displayName ?? memory.displayNameSnapshot ?? "お客様",
    tags: memory.tags,
    summary: memory.lastInteractionSummary ?? memory.conversationSummary,
  }));

  return <main className="shell">
    <header className="header"><div className="brand">Velvet</div><span className="subtle">営業アシスタント</span></header>
    <section className="hero"><h1>すぐ思い出せる。</h1><p>探す・見る・記録する。必要な時だけ、最短で。</p></section>
    <Link href="/people" aria-label="お客様を探す"><div className="searchBox">名前・趣味・前回の話などで探す</div></Link>
    <div className="sectionTitle">最近のお客様メモ</div>
    <div className="stack">{recent.map((row) => <Link className="card personRow" href={`/people/${row.customerId}`} key={row.customerId}>
      <div className="avatar">{row.displayName.slice(0, 1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.summary && <div className="personMeta">{row.summary}</div>}{!row.summary && row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 4).join(" · ")}</div>}</div><span>›</span>
    </Link>)}</div>
    <BottomNav />
  </main>;
}
