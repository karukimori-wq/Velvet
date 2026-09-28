import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listCustomerMemories } from "@/lib/customer-memory-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { listCaptures } from "@/lib/capture-repository";
import { listGifts } from "@/lib/gift-repository";
import { listScheduleEntries, type ScheduleEntry } from "@/lib/schedule-repository";
import { matchesAllTerms, parseLocalSearchIntent } from "@/lib/search-intent";
import { getPlanAccess, hasVelvetFeature } from "@/lib/plan-access";

const kindLabel={shift:"出勤",visit:"来店",birthday:"誕生日",unavailable:"約束",self_investment:"自分の予定",other:"その他"} as const;
const dateLabel=(value:string)=>new Intl.DateTimeFormat("ja-JP",{month:"numeric",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Tokyo"}).format(new Date(value));
const tokyoDateParts=(value:string)=>{const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const get=(type:string)=>parts.find(part=>part.type===type)?.value??"";return {year:get("year"),month:get("month"),day:get("day")};};
const normalizeDigits=(value:string)=>value.normalize("NFKC");
const parseDateTerm=(term:string)=>{const value=normalizeDigits(term).replace(/[年月]/g,"/").replace(/日$/g,"");const match=value.match(/^(?:(\d{4})[\/.-])?(\d{1,2})[\/.-](\d{1,2})$/);if(!match)return undefined;return {year:match[1],month:match[2].padStart(2,"0"),day:match[3].padStart(2,"0")};};
function scheduleMatchesDateTerms(entry:ScheduleEntry,dateTerms:ReturnType<typeof parseDateTerm>[]){
  if(dateTerms.length===0)return true;const parts=tokyoDateParts(entry.startsAt);return dateTerms.every(term=>term&&parts.month===term.month&&parts.day===term.day&&(!term.year||parts.year===term.year));
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; natural?: string }> }) {
  const { q = "", natural } = await searchParams;
  const query = q.trim();
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [customers, memories, captures, gifts, schedule, access] = await Promise.all([
    listGrowthCustomers(workspaceId, userId),
    listCustomerMemories(workspaceId, userId),
    listCaptures(workspaceId, userId),
    listGifts(workspaceId, userId),
    listScheduleEntries(workspaceId, userId),
    getPlanAccess(ownerUserId),
  ]);

  const advancedSearchAllowed = hasVelvetFeature(access, "history.search");
  const useNatural = Boolean(natural && query && advancedSearchAllowed);
  const localIntent = query ? parseLocalSearchIntent(query) : undefined;
  const rawTerms = useNatural && localIntent?.terms.length ? localIntent.terms : query ? query.normalize("NFKC").split(/\s+/).filter(Boolean) : [];
  const parsedDateTerms = rawTerms.map(parseDateTerm);
  const dateTerms = parsedDateTerms.filter(Boolean);
  const terms = rawTerms.filter((_,index)=>!parsedDateTerms[index]);
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

  const scheduleResults = rawTerms.length ? schedule.filter((entry) => {
    const customerName = entry.customerId ? customerById.get(entry.customerId)?.displayName ?? memoryById.get(entry.customerId)?.displayNameSnapshot : undefined;
    const haystack = [entry.title, entry.note, kindLabel[entry.kind], customerName].filter(Boolean).join(" ");
    return matchesAllTerms(haystack, terms) && scheduleMatchesDateTerms(entry,dateTerms);
  }).slice(0, 12) : [];

  const captureResults = advancedSearchAllowed && terms.length ? captures.filter((entry) => matchesAllTerms(entry.value, terms) && entry.customerId).slice(0, 10) : [];
  const giftResults = advancedSearchAllowed && terms.length ? gifts.filter((gift) => matchesAllTerms([gift.item, gift.occasion, gift.note].filter(Boolean).join(" "), terms)).slice(0, 10) : [];
  const displayNameFor = (customerId: string) => customerById.get(customerId)?.displayName ?? memoryById.get(customerId)?.displayNameSnapshot ?? "お客様";
  const totalResults = customerResults.length + scheduleResults.length + giftResults.length + captureResults.length;

  return <main className="shell searchShell">
    <AppHeader title="思い出す" />
    <section className="searchIntro"><strong>何を思い出しますか？</strong><small>{advancedSearchAllowed ? "お客様・予定・イベント・話したこと・贈り物から探せます。" : "お客様・予定・イベントをキーワードで探せます。"}</small></section>
    <form action="/search" method="get" className="stack searchMainForm">
      <input className="searchBox" name="q" defaultValue={q} placeholder={advancedSearchAllowed ? "例：山本 同伴 2/29 ロレックス" : "例：山本 同伴 2/29"} autoComplete="off" enterKeyHint="search" />
      <div className="searchActions">
        <button className="secondaryButton" type="submit">キーワードで探す</button>
        {advancedSearchAllowed ? <button className="primaryButton" type="submit" name="natural" value="1">文章で探す</button> : <Link className="primaryButton actionLink" href="/plans">Proで履歴まで探す</Link>}
      </div>
    </form>
    {!query && <div className="card empty searchEmpty"><span>⌕</span><strong>覚えている言葉を入れてください</strong><small>名前が分からなくても、予定・イベント・日付などから探せます。</small></div>}
    {natural && query && !advancedSearchAllowed && <div className="card noticeCard"><div className="timelineTitle">履歴まで探すのはPro機能です</div><div className="timelineBody">Freeではお客様・予定・イベントのキーワード検索を使えます。</div></div>}
    {useNatural && query && <div className="card noticeCard"><div className="formHint">この言葉で探しています</div><div className="timelineBody">{localIntent?.terms.length ? localIntent.terms.join(" ・ ") : query}</div><div className="formHint">この検索はAIを使わず、Velvet内で処理します。</div></div>}
    {query && <><div className="searchResultSummary"><strong>{totalResults}</strong><span>件見つかりました</span></div><div className="sectionTitle">お客様 · {customerResults.length}件</div><div className="stack">{customerResults.map((row) => <div className="card searchPersonRow" key={row.customerId}><Link className="searchPersonMain" href={`/people/${row.customerId}`}><div className="avatar">{row.displayName.slice(0, 1)}</div><div className="personMain"><div className="personName">{row.displayName}</div>{row.tags.length > 0 && <div className="personMeta">{row.tags.slice(0, 4).join(" · ")}</div>}</div></Link><Link className="captureMiniAction" href={`/capture?customerId=${encodeURIComponent(row.customerId)}`} aria-label={`${row.displayName}さんのことを覚える`}><strong>＋</strong><span>覚える</span></Link></div>)}</div>
    {scheduleResults.length > 0 && <><div className="sectionTitle">予定・イベント · {scheduleResults.length}件</div><div className="stack">{scheduleResults.map((entry) => <Link className="card searchMemoryResult" href={`/schedule?view=day&cursor=${tokyoDateParts(entry.startsAt).year}-${tokyoDateParts(entry.startsAt).month}-${tokyoDateParts(entry.startsAt).day}`} key={entry.id}><div className="timelineTitle">{entry.title}</div><div className="formHint">{dateLabel(entry.startsAt)} · {kindLabel[entry.kind]}{entry.customerId ? ` · ${displayNameFor(entry.customerId)}さん` : ""}</div>{entry.note&&<div className="timelineBody">{entry.note}</div>}</Link>)}</div></>}
    {captureResults.length > 0 && <><div className="sectionTitle">話したこと</div><div className="stack">{captureResults.map((entry) => <Link className="card searchMemoryResult" href={`/people/${entry.customerId}`} key={entry.id}><div className="timelineTitle">{entry.value}</div><div className="formHint">{displayNameFor(entry.customerId!)}</div></Link>)}</div></>}
    {giftResults.length > 0 && <><div className="sectionTitle">贈り物</div><div className="stack">{giftResults.map((gift) => <Link className="card searchMemoryResult" href={`/people/${gift.customerId}`} key={gift.id}><div className="timelineTitle">{gift.direction === "received" ? "もらった" : "あげた"} · {gift.item}</div><div className="formHint">{displayNameFor(gift.customerId)}</div></Link>)}</div></>}
    {totalResults === 0 && <div className="card empty searchEmpty"><span>○</span><strong>見つかりませんでした</strong><small>言葉を短くしたり、別の日付や特徴で探してみてください。</small></div>}</>}
    <BottomNav />
  </main>;
}
