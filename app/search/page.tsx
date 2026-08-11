import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { listPeople } from "@/lib/demo-data";
import { listCaptures } from "@/lib/capture-repository";
import { listGifts } from "@/lib/gift-repository";
import { getCurrentOwnerUserId } from "@/lib/current-owner";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const ownerUserId = getCurrentOwnerUserId();
  const people = listPeople(ownerUserId);

  const personResults = query
    ? people.filter((person) => {
        const haystack = [
          person.name,
          person.rank,
          ...person.personality,
          ...person.timeline.flatMap((item) => [item.date, item.title, item.body]),
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(query);
      })
    : [];

  const captureResults = query
    ? listCaptures(ownerUserId).filter((entry) => entry.value.toLowerCase().includes(query)).slice(0, 20)
    : [];

  const giftResults = query
    ? listGifts(ownerUserId).filter((gift) => [gift.item, gift.occasion, gift.note].filter(Boolean).join(" ").toLowerCase().includes(query)).slice(0, 20)
    : [];

  const personMap = new Map(people.map((person) => [person.id, person]));

  return (
    <main className="shell">
      <header className="header"><div className="brand">Search</div></header>
      <form action="/search" method="get">
        <input className="searchBox" name="q" defaultValue={q} placeholder="名前・趣味・特徴・前回の話など" autoComplete="off" />
      </form>

      {!query && (
        <>
          <div className="sectionTitle">例</div>
          <div className="chips">
            {["ゴルフ", "ロレックス", "既婚", "響", "メガネ", "財布"].map((value) => <Link className="chip" href={`/search?q=${encodeURIComponent(value)}`} key={value}>{value}</Link>)}
          </div>
        </>
      )}

      {query && (
        <>
          <div className="sectionTitle">People · {personResults.length}件</div>
          <div className="stack">
            {personResults.map((person) => (
              <Link className="card personRow" href={`/people/${person.id}`} key={person.id}>
                <div className="avatar">{person.name.slice(0, 1)}</div>
                <div className="personMain">
                  <div className="personName">{person.name}{person.rank ? ` · ${person.rank}` : ""}</div>
                  {person.personality.length > 0 && <div className="personMeta">{person.personality.slice(0, 5).join(" · ")}</div>}
                </div>
                <span>›</span>
              </Link>
            ))}
          </div>

          {giftResults.length > 0 && (
            <>
              <div className="sectionTitle">Gift</div>
              <div className="stack">
                {giftResults.map((gift) => {
                  const person = personMap.get(gift.personId);
                  return (
                    <Link className="card" href={`/people/${gift.personId}`} key={gift.id}>
                      <div className="timelineTitle">{gift.direction === "received" ? "もらった" : "あげた"} · {gift.item}</div>
                      {person && <div className="timelineBody">{person.name}</div>}
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {captureResults.length > 0 && (
            <>
              <div className="sectionTitle">Capture</div>
              <div className="stack">
                {captureResults.map((entry) => {
                  const person = entry.personId ? personMap.get(entry.personId) : undefined;
                  const content = <div className="card"><div className="timelineTitle">{entry.value}</div>{person && <div className="timelineBody">{person.name}</div>}</div>;
                  return entry.personId ? <Link href={`/people/${entry.personId}`} key={entry.id}>{content}</Link> : <div key={entry.id}>{content}</div>;
                })}
              </div>
            </>
          )}

          {personResults.length + giftResults.length + captureResults.length === 0 && <div className="card empty">見つかりませんでした</div>}
        </>
      )}
      <BottomNav />
    </main>
  );
}
