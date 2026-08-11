import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listPeopleStore } from "@/lib/person-store";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string; imported?: string; skipped?: string }> }) {
  const { q = "", imported, skipped } = await searchParams;
  const query = q.trim().toLowerCase();
  const identity = await getRequestIdentity();
  const people = await listPeopleStore(identity.ownerUserId);
  const filtered = query
    ? people.filter((person) => [person.name, person.rank, ...person.personality].filter(Boolean).join(" ").toLowerCase().includes(query))
    : people;

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">People</div>
        <Link className="subtle" href="/people/new">＋ 追加</Link>
      </header>
      {(imported || skipped) && <div className="card successCard">Import完了 · 追加 {Number(imported ?? 0)}件{Number(skipped ?? 0) > 0 ? ` · スキップ ${Number(skipped)}件` : ""}</div>}
      <form action="/people" method="get">
        <input className="searchBox" name="q" defaultValue={q} placeholder="名前・特徴・趣味・ブランドなど" autoComplete="off" />
      </form>

      <div className="sectionTitle">{query ? `${filtered.length}件` : "すべて"}</div>
      <div className="stack">
        {filtered.map((person) => (
          <Link className="card personRow" href={`/people/${person.id}`} key={person.id}>
            <div className="avatar">{person.name.slice(0, 1)}</div>
            <div className="personMain">
              <div className="personName">{person.name} {person.rank ? `· ${person.rank}` : ""}</div>
              {person.personality.length > 0 && <div className="personMeta">{person.personality.slice(0, 5).join(" · ")}</div>}
            </div>
            <span>›</span>
          </Link>
        ))}
        {filtered.length === 0 && <div className="card empty">見つかりませんでした</div>}
      </div>
      <BottomNav />
    </main>
  );
}
