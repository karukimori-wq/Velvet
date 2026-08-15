import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { visibleNextTopics } from "@/lib/next-topic";

const tokyoDate = (value: Date | string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const tokyoTime = (value: string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export default async function HomePage() {
  const { workspaceId, userId } = await getRequestIdentity();
  const [customers, memories, schedule] = await Promise.all([listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId), listScheduleEntries(workspaceId, userId)]);
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const memoryByCustomer = new Map(memories.map((memory) => [memory.customerId, memory]));
  const today = tokyoDate(new Date());
  const todayEntries = schedule.filter((entry) => tokyoDate(entry.startsAt) === today);
  const todayVisitors = todayEntries.filter((entry) => entry.kind === "visit" && entry.customerId);
  const otherToday = todayEntries.filter((entry) => entry.kind !== "visit");

  return <main className="shell">
    <header className="header"><div className="brand">Velvet</div><span className="subtle">営業アシスタント</span></header>
    <section className="hero"><h1>今日</h1><p>予定と、来るお客様だけ確認できます。</p></section>
    <div className="sectionTitle">今日来るお客様</div><div className="stack">
      {todayVisitors.map((entry) => {
        const customerId = entry.customerId!; const customer = customerById.get(customerId); const memory = memoryByCustomer.get(customerId); const name = customer?.displayName ?? memory?.displayNameSnapshot ?? "お客様";
        const nextTopics = visibleNextTopics(memory?.nextTopicHint, 2);
        const recallItems = [memory?.cautionNote ? { label: "注意", value: memory.cautionNote } : undefined, memory?.lastInteractionSummary ? { label: "前回", value: memory.lastInteractionSummary } : undefined].filter(Boolean).slice(0, 2) as Array<{ label: string; value: string }>;
        return <article className="card stack" key={entry.id}><div className="personRow"><div className="avatar">{name.slice(0, 1)}</div><div className="personMain"><div className="personName">{name}</div><div className="personMeta">{tokyoTime(entry.startsAt)} 来店予定</div></div></div>{recallItems.length > 0 && <div className="stack">{recallItems.map((item) => <div key={item.label}><div className="formHint">{item.label}</div><div className="timelineBody">{item.value}</div></div>)}</div>}{nextTopics.length > 0 && <div><div className="formHint">次に話すこと</div>{nextTopics.map((topic) => <div className="timelineBody" key={topic}>・{topic}</div>)}</div>}<div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${customerId}`}>見る</Link><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(customerId)}`}>接客メモ</Link></div></article>;
      })}
      {todayVisitors.length === 0 && <div className="card empty">今日の来店予定はありません</div>}
    </div>
    <div className="sectionTitle">今日の予定</div><div className="stack">{otherToday.map((entry) => <article className="card" key={entry.id}><div className="row"><strong>{entry.title}</strong><span className="subtle">{tokyoTime(entry.startsAt)}</span></div>{entry.note && <div className="timelineBody">{entry.note}</div>}</article>)}{otherToday.length === 0 && <div className="card empty">ほかの予定はありません</div>}</div>
    <div className="sectionTitle">お客様を探す</div><Link href="/people" aria-label="お客様を探す"><div className="searchBox">名前・特徴・趣味・前回の話など</div></Link><BottomNav />
  </main>;
}
