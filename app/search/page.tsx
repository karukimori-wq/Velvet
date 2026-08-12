import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listCaptures } from "@/lib/capture-repository";
import { listGifts } from "@/lib/gift-repository";
import { matchesAllTerms } from "@/lib/search-intent";
import { parseSearchIntent } from "@/lib/ai-platform-core";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; natural?: string }> }) {
  const { q = "", natural } = await searchParams;
  const query = q.trim();
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [customers, memories, captures, gifts] = await Promise.all([
    listGrowthCustomers(workspaceId, userId),
    listCustomerMemories(workspaceId, userId),
    listCaptures(workspaceId, userId),
    listGifts(workspaceId, userId),
  ]);
  const intent = natural && query ? await parseSearchIntent(query, ownerUserId) : undefined;
  const terms = intent?.terms.length ? intent.terms : query ? [query] : [];
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const memoryById = new Map(memories.map((memory) => [memory.customerId, memory]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const customerResults = terms.length ? [...ids].flatMap((customerId) => {
    const customer = customerById.get(customerId);
    const memory = memoryById.get(customerId);
    const displayName = customer?.displayName ?? memory?.displayNameSnapshot ?? `Customer ${customerId}`;
    const haystack = [displayName, customerId, memory?.personalityNote, memory?.preferenceNote, memory?.cautionNote, memory?.conversationSummary, memory?.lastInteractionSummary, memory?.nextTopicHint, ...(memory?.tags ?? [])].filter(Boolean).join(" ");
    return matchesAllTerms(haystack, terms) ? [{ customerId, displayName, tags: memory?.tags ?? [] }] : [];
  }) : [];
  const captureResults = terms.length ? captures.filter((entry) => matchesAllTerms(entry.value, terms)).slice(0, 20) : [];
  const giftResults = terms.length ? gifts.filter((gift) => matchesAllTerms([gift.item, gift.occasion, gift.note].filter(Boolean).join(" "), terms)).slice(0, 20) : [];
  const displayNameFor = (customerId: string) => customerById.get(customerId)?.displayName ?? memoryById.get(customerId)?.displayNameSnapshot ?? `Customer ${customerId}`;

  return <main className="shell">
    <header className="header"><div className="brand">Search</div></header>
    <form action="/search" method="get" className="stack"><input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・前回の話など" autoComplete="off" /><div className="searchActions"><button className="secondaryButton" type="submit">検索</button><button className="secondaryButton" type="submit" name="natural" value="1">文章で探す</button></div></form>
    {natural && query && <div className="card noticeCard"><div className="timelineTitle">文章検索</div><div className="timelineBody">{intent?.terms.length ? `「${intent.terms.join("」「")}」で絞り込みました。` : "検索語を解釈できませんでした。"}</div></div>}
    {!query && <><div className="sectionTitle">例</div><div className="chips">{["ゴルフ", "ロレックス", "既婚", "前回の話"].map((value) => <Link className="chip" href={`/search?q=${encodeURIComponent(value)}`} key={value}>{value}</Link>)}</div></>}
    {query && <>
      <div className="sectionTitle">Customer · {customerResults.length}件</div><div className="stack">{customerResults.map((row) => <Link className="card personRow" href={`/people/${row.customerId}`} key={row.customerId}><div className="avatar">{row.displayName.slice(0, 1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 5).join(" · ")}</div>}</div><span>›</span></Link>)}</div>
      {giftResults.length > 0 && <><div className="sectionTitle">Gift</div><div className="stack">{giftResults.map((gift) => <Link className="card" href={`/people/${gift.customerId}`} key={gift.id}><div className="timelineTitle">{gift.direction === "received" ? "もらった" : "あげた"} · {gift.item}</div><div className="timelineBody">{displayNameFor(gift.customerId)}</div></Link>)}</div></>}
      {captureResults.length > 0 && <><div className="sectionTitle">Capture</div><div className="stack">{captureResults.map((entry) => entry.customerId ? <Link className="card" href={`/people/${entry.customerId}`} key={entry.id}><div className="timelineTitle">{entry.value}</div><div className="timelineBody">{displayNameFor(entry.customerId)}</div></Link> : <div className="card" key={entry.id}><div className="timelineTitle">{entry.value}</div></div>)}</div></>}
      {customerResults.length + giftResults.length + captureResults.length === 0 && <div className="card empty">見つかりませんでした</div>}
    </>}
    <BottomNav />
  </main>;
}
