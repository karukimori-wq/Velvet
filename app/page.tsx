import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { people } from "@/lib/demo-data";

export default function HomePage() {
  const planned = people.filter((person) => person.nextVisit);

  return (
    <main className="shell">
      <header className="header">
        <div className="brand">Velvet</div>
        <span className="subtle">営業アシスタント</span>
      </header>

      <section className="hero">
        <h1>すぐ思い出せる。</h1>
        <p>探す・見る・記録する。必要な時だけ、最短で。</p>
      </section>

      <Link href="/people" aria-label="Peopleを検索">
        <div className="searchBox">名前・趣味・前回の話などで検索</div>
      </Link>

      {planned.length > 0 && <div className="sectionTitle">今日の来店予定</div>}
      <div className="stack">
        {planned.map((person) => (
          <Link className="card personRow" href={`/people/${person.id}`} key={person.id}>
            <div className="avatar">{person.name.slice(0, 1)}</div>
            <div className="personMain">
              <div className="personName">{person.name}</div>
              <div className="personMeta">{person.nextVisit} · {person.personality.slice(0, 3).join(" · ")}</div>
            </div>
            <span>›</span>
          </Link>
        ))}
      </div>

      <div className="sectionTitle">最近見た人</div>
      <div className="stack">
        {people.slice(0, 3).map((person) => (
          <Link className="card personRow" href={`/people/${person.id}`} key={person.id}>
            <div className="avatar">{person.name.slice(0, 1)}</div>
            <div className="personMain">
              <div className="personName">{person.name} {person.rank ? `· ${person.rank}` : ""}</div>
              <div className="personMeta">{person.personality.slice(0, 4).join(" · ")}</div>
            </div>
            <span>›</span>
          </Link>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
