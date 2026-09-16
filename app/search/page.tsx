import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listCaptures } from "@/lib/capture-repository";
import { listGifts } from "@/lib/gift-repository";
import { matchesAllTerms, parseLocalSearchIntent } from "@/lib/search-intent";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; natural?: string }> }) {
  const { q = "", natural } = await searchParams;
  const query = q.trim();
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [customers, memories, captures, gifts, access] = await Promise.all([
    listGrowthCustomers(workspaceId, userId),
    listCustomerMemories(workspaceId, userId),
    listCaptures(workspaceId, userId),
    listGifts(workspaceId, userId),
    getPlanAccess(ownerUserId),
  ]);

  const advancedSearchAllowed = hasVelvetFeature(access, "history.search");
  const useNatural = Boolean(natural && query && advancedSearchAllowed);
  // Advanced search stays deterministic: phrase-like input is decomposed locally
  // instead of spending AI usage just to find stored customer records.
  const localIntent = query ? parseLocalSearchIntent(query) : undefined;
  const terms = useNatural && localIntent?.terms.length ? localIntent.terms : query ? query.normalize("NFKC").split(/\s+/).filter(Boolean) : [];
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));
  const memoryById = new Map(memories.map((memory) => [memory.customerId, memory]));
  const ids = new Set([...customers.map((customer) => customer.customerId), ...memories.map((memory) => memory.customerId)]);

  const customerResults = terms.length ? [...ids].flatMap((customerId) => {
    const customer = customerById.get(customerId);
    const memory = memoryById.get(customerId);
    const displayName = customer?.displayName ?? memory?.displayNameSnapshot ?? "お客様";
    const basicFields = [displayName, memory?.personalityNote, memory?.preferenceNote, ...(memory?.tags ?? [])];
    const proFields = advancedSearchAllowed ? [memory?.cautionNote, memory?.conversationSummary, memory?.lastInteractionSummary, memory?.nextTopicHint] : [];
    const haystack = [...basicFields, ...proFields].filter(Boolean).join(" ");
    return matchesAllTerms(haystack, terms) ? [{ customerId, displayName, tags: memory?.tags ?? [] }] : [];
  }) : [];

  // Free search is intentionally profile-only. Pro expands the same local search
  // across retained conversations and gifts without requiring an AI request.
  const captureResults = advancedSearchAllowed && terms.length ? captures.filter((entry) => matchesAllTerms(entry.value, terms) && entry.customerId).slice(0, 10) : [];
  const giftResults = advancedSearchAllowed && terms.length ? gifts.filter((gift) => matchesAllTerms([gift.item, gift.occasion, gift.note].filter(Boolean).join(" "), terms)).slice(0, 10) : [];
  const displayNameFor = (customerId: string) => customerById.get(customerId)?.displayName ?? memoryById.get(customerId)?.displayNameSnapshot ?? "お客様";
  const totalResults = customerResults.length + giftResults.length + captureResults.length;

  return <main className="shell searchShell">
    <AppHeader title="探す" />
    <section className="searchIntro"><strong>誰のことを思い出しますか？</strong><small>{advancedSearchAllowed ? "名前だけでなく、話したことや贈り物からも探せます。" : "名前・特徴・趣味・タグから探せます。"}</small></section>
    <form action="/search" method="get" className="stack searchMainForm">
      <input className="searchBox" name="q" defaultValue={q} placeholder={advancedSearchAllowed ? "例：ゴルフが好きでロレックスの人" : "例：ゴルフ ロレックス"} autoComplete="off" enterKeyHint="search" />
      <div className="searchActions">
        <button className="secondaryButton" type="submit">キーワードで探す</button>
        {advancedSearchAllowed ? <button className="primaryButton" type="submit" name="natural" value="1">文章で探す</button> : <Link className="primaryButton actionLink" href="/plans">Proで履歴まで探す</Link>}
      </div>
    </form>
    {!query && <div className="card empty searchEmpty"><span>⌕</span><strong>覚えている言葉を入れてください</strong><small>名前が分からなくても、趣味や特徴などから探せます。</small></div>}
    {natural && query && !advancedSearchAllowed && <div className="card noticeCard"><div className="timelineTitle">履歴まで探すのはPro機能です</div><div className="timelineBody">Freeでは名前・特徴・趣味・タグのキーワード検索を使えます。</div></div>}
    {useNatural && query && <div className="card noticeCard"><div className="formHint">この言葉で探しています</div><div className="timelineBody">{localIntent?.terms.length ? localIntent.terms.join(" ・ ") : query}</div><div className="formHint">この検索はAIを使わず、Velvet内で処理します。</div></div>}
    {query && <><div className="searchResultSummary"><strong>{totalResults}</strong><span>件見つかりました</span></div><div className="sectionTitle">お客様 · {customerResults.length}件</div><div className="stack">{customerResults.map((row) => <div className="card searchPersonRow" key={row.customerId}><Link className="searchPersonMain" href={`/people/${row.customerId}`}><div className="avatar">{row.displayName.slice(0, 1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 4).join(" · ")}</div>}</div></Link><Link className="captureMiniAction" href={`/capture?customerId=${encodeURIComponent(row.customerId)}`} aria-label={`${row.displayName}さんのことを覚える`}><strong>＋</strong><span>覚える</span></Link></div>)}</div>
    {captureResults.length > 0 && <><div className="sectionTitle">話したこと</div><div className="stack">{captureResults.map((entry) => <Link className="card searchMemoryResult" href={`/people/${entry.customerId}`} key={entry.id}><div className="timelineTitle">{entry.value}</div><div className="formHint">{displayNameFor(entry.customerId!)}</div></Link>)}</div></>}
    {giftResults.length > 0 && <><div className="sectionTitle">贈り物</div><div className="stack">{giftResults.map((gift) => <Link className="card searchMemoryResult" href={`/people/${gift.customerId}`} key={gift.id}><div className="timelineTitle">{gift.direction === "received" ? "もらった" : "あげた"} · {gift.item}</div><div className="formHint">{displayNameFor(gift.customerId)}</div></Link>)}</div></>}
    {totalResults === 0 && <div className="card empty searchEmpty"><span>○</span><strong>見つかりませんでした</strong><small>言葉を短くしたり、別の特徴で探してみてください。</small></div>}</>}
    <BottomNav />
  </main>;
}
