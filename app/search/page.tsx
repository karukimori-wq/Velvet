import Link from "next/link";
import { redirect } from "next/navigation";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listCaptures } from "@/lib/capture-repository";
import { listGifts } from "@/lib/gift-repository";
import { matchesAllTerms } from "@/lib/search-intent";
import { parseSearchIntent } from "@/lib/ai-platform-core";
import { getPlanAccess, hasVelvetFeature, isWithinHistoryWindow } from "@/lib/plan-access";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; natural?: string }> }) {
  const { q = "", natural } = await searchParams;
  const query = q.trim();
  if (!query && !natural) redirect("/people");
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [customers, memories, captures, gifts, access] = await Promise.all([
    listGrowthCustomers(workspaceId, userId), listCustomerMemories(workspaceId, userId), listCaptures(workspaceId, userId), listGifts(workspaceId, userId), getPlanAccess(ownerUserId),
  ]);
  const advancedSearchAllowed = hasVelvetFeature(access, "history.search");
  const useNatural = Boolean(natural && query && advancedSearchAllowed);
  const intent = useNatural ? await parseSearchIntent(query, ownerUserId) : undefined;
  const terms = intent?.terms.length ? intent.terms : query ? [query] : [];
  const visibleCaptures = access.fullHistory ? captures : captures.filter((entry) => isWithinHistoryWindow(entry.createdAt, access));
  const visibleGifts = access.fullHistory ? gifts : gifts.filter((gift) => isWithinHistoryWindow(gift.occurredAt, access));
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const memoryById = new Map(memories.map((memory) => [memory.customerId, memory]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);
  const customerResults = terms.length ? [...ids].flatMap((customerId) => {
    const customer = customerById.get(customerId); const memory = memoryById.get(customerId);
    const displayName = customer?.displayName ?? memory?.displayNameSnapshot ?? "お客様";
    const haystack = [displayName, memory?.personalityNote, memory?.preferenceNote, memory?.cautionNote, memory?.conversationSummary, memory?.lastInteractionSummary, memory?.nextTopicHint, ...(memory?.tags ?? [])].filter(Boolean).join(" ");
    return matchesAllTerms(haystack, terms) ? [{ customerId, displayName, tags: memory?.tags ?? [], last: memory?.lastInteractionSummary, next: memory?.nextTopicHint }] : [];
  }) : [];
  const captureResults = terms.length ? visibleCaptures.filter((entry) => matchesAllTerms(entry.value, terms) && entry.customerId).slice(0, 10) : [];
  const giftResults = terms.length ? visibleGifts.filter((gift) => matchesAllTerms([gift.item, gift.occasion, gift.note].filter(Boolean).join(" "), terms)).slice(0, 10) : [];
  const displayNameFor = (customerId: string) => customerById.get(customerId)?.displayName ?? memoryById.get(customerId)?.displayNameSnapshot ?? "お客様";

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/people">‹ お客様</Link><div className="brand">詳しく探す</div></header>
    <form action="/search" method="get" className="stack"><input className="searchBox" name="q" defaultValue={q} placeholder="例：ゴルフ ロレックス" autoComplete="off" /><div className="searchActions"><button className="secondaryButton" type="submit">キーワード検索</button>{advancedSearchAllowed?<button className="primaryButton" type="submit" name="natural" value="1">文章で探す</button>:<Link className="primaryButton actionLink" href="/plans">Proで詳しく探す</Link>}</div></form>
    {natural && query && !advancedSearchAllowed && <div className="card noticeCard"><div className="timelineTitle">文章で探すはPro機能です</div><div className="timelineBody">Freeでは名前・特徴・趣味などのキーワード検索を使えます。</div></div>}
    {useNatural && query && <div className="card noticeCard"><div className="formHint">この条件で探しました</div><div className="timelineBody">{intent?.terms.length ? intent.terms.join(" ・ ") : query}</div></div>}
    <div className="sectionTitle">お客様 · {customerResults.length}件</div>
    <div className="stack">{customerResults.map((row) => <Link className="card personRow" href={`/people/${row.customerId}`} key={row.customerId}><div className="avatar">{row.displayName.slice(0, 1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 4).join(" · ")}</div>}</div><span>›</span></Link>)}</div>
    {captureResults.length > 0 && <><div className="sectionTitle">話した内容</div><div className="stack">{captureResults.map((entry) => <Link className="card" href={`/people/${entry.customerId}`} key={entry.id}><div className="timelineTitle">{entry.value}</div><div className="formHint">{displayNameFor(entry.customerId!)}</div></Link>)}</div></>}
    {giftResults.length > 0 && <><div className="sectionTitle">贈り物</div><div className="stack">{giftResults.map((gift) => <Link className="card" href={`/people/${gift.customerId}`} key={gift.id}><div className="timelineTitle">{gift.direction === "received" ? "もらった" : "あげた"} · {gift.item}</div><div className="formHint">{displayNameFor(gift.customerId)}</div></Link>)}</div></>}
    {customerResults.length + giftResults.length + captureResults.length === 0 && <div className="card empty">条件に合うお客様は見つかりませんでした</div>}
  </main>;
}
