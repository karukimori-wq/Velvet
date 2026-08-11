import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getCurrentOwnerUserId } from "@/lib/current-owner";
import { getPersonStore } from "@/lib/person-store";
import { getActiveVisitForPerson } from "@/lib/visit-repository";
import { startVisitAction } from "@/app/visits/actions";

export default async function PersonDetailPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const ownerUserId = getCurrentOwnerUserId();
  const person = await getPersonStore(personId, ownerUserId);
  if (!person) notFound();
  const activeVisit = await getActiveVisitForPerson(person.id, ownerUserId);

  return (
    <main className="shell">
      <header className="header">
        <Link className="subtle" href="/people">‹ People</Link>
        <Link className="subtle" href={`/people/${person.id}/edit`}>編集</Link>
      </header>

      <section className="hero">
        <h1>{person.name}{person.rank ? ` · ${person.rank}` : ""}</h1>
        {person.nextVisit && <p>{person.nextVisit} 来店予定</p>}
      </section>

      {person.personality.length > 0 && (
        <>
          <div className="sectionTitle">パーソナリティ</div>
          <div className="chips">
            {person.personality.map((value) => <span className="chip" key={value}>{value}</span>)}
          </div>
        </>
      )}

      <div className="sectionTitle">クイック操作</div>
      <div className="actions">
        {activeVisit ? (
          <Link className="action actionLink activeAction" href={`/visits/${activeVisit.id}`}>来店中</Link>
        ) : (
          <form action={startVisitAction}>
            <input type="hidden" name="personId" value={person.id} />
            <button className="action fullAction" type="submit">来店</button>
          </form>
        )}
        <Link className="action actionLink" href={`/capture?personId=${person.id}`}>Capture</Link>
        <Link className="action actionLink" href={`/people/${person.id}/gift`}>Gift</Link>
        <Link className="action actionLink" href={`/relationships/new?personId=${person.id}`}>関係</Link>
      </div>

      {person.timeline.length > 0 && (
        <>
          <div className="sectionTitle">タイムライン</div>
          <div className="timeline">
            {person.timeline.map((item) => (
              <article className="timelineItem" key={item.id}>
                <div className="timelineDate">{item.date}</div>
                <div className="timelineTitle">{item.title}</div>
                {item.body && <div className="timelineBody">{item.body}</div>}
              </article>
            ))}
          </div>
        </>
      )}

      {person.timeline.length === 0 && <div className="sectionTitle">履歴はまだありません</div>}
      <BottomNav />
    </main>
  );
}
