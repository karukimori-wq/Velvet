import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listPersonContacts } from "@/lib/contact-repository";
import { getPersonProfile } from "@/lib/person-profile-repository";
import { getPersonStore } from "@/lib/person-store";
import { getActiveVisitForPerson } from "@/lib/visit-repository";
import { startVisitAction } from "@/app/visits/actions";

const contactLabels: Record<string, string> = {
  phone: "電話", email: "メール", line: "LINE", instagram: "Instagram", x: "X", tiktok: "TikTok", other: "連絡先",
};
const maritalLabels: Record<string, string> = { unmarried: "未婚", married: "既婚", unknown: "婚姻状況不明" };

export default async function PersonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ justEnded?: string }>;
}) {
  const { personId } = await params;
  const { justEnded } = await searchParams;
  const identity = await getRequestIdentity();
  const person = await getPersonStore(personId, identity.ownerUserId);
  if (!person) notFound();
  const [activeVisit, contacts, profile] = await Promise.all([
    getActiveVisitForPerson(person.id, identity.ownerUserId),
    listPersonContacts(person.id, identity.ownerUserId),
    getPersonProfile(person.id, identity.ownerUserId),
  ]);
  const profileValues = [
    profile?.occupation,
    profile?.company,
    profile?.area,
    profile?.birthDate ? `誕生日 ${profile.birthDate}` : undefined,
    profile?.maritalStatus ? maritalLabels[profile.maritalStatus] : undefined,
  ].filter(Boolean) as string[];

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

      {justEnded && !activeVisit && (
        <Link className="card actionLink noticeCard" href={`/capture?personId=${person.id}&fromVisit=${encodeURIComponent(justEnded)}`}>
          <div className="timelineTitle">30秒メモ</div>
          <div className="timelineBody">覚えているうちに、タップ中心で残す</div>
        </Link>
      )}

      {(person.personality.length > 0 || profileValues.length > 0) && <>
        <div className="sectionTitle">パーソナリティ</div>
        <div className="chips">
          {profileValues.map((value) => <span className="chip" key={value}>{value}</span>)}
          {person.personality.map((value) => <span className="chip" key={value}>{value}</span>)}
        </div>
      </>}

      {contacts.length > 0 && <>
        <div className="sectionTitle">連絡先</div>
        <div className="chips">
          {contacts.map((contact) => <span className="chip" key={contact.id}>{contactLabels[contact.type]} · {contact.value}</span>)}
        </div>
      </>}

      <div className="sectionTitle">クイック操作</div>
      <div className="actions">
        {activeVisit ? <Link className="action actionLink activeAction" href={`/visits/${activeVisit.id}`}>来店中</Link> : <form action={startVisitAction}><input type="hidden" name="personId" value={person.id} /><button className="action fullAction" type="submit">来店</button></form>}
        <Link className="action actionLink" href={`/capture?personId=${person.id}`}>Capture</Link>
        <Link className="action actionLink" href={`/people/${person.id}/gift`}>Gift</Link>
        <Link className="action actionLink" href={`/relationships/new?personId=${person.id}`}>関係</Link>
      </div>
      {person.timeline.length > 0 ? <><div className="sectionTitle">タイムライン</div><div className="timeline">{person.timeline.map((item) => <article className="timelineItem" key={item.id}><div className="timelineDate">{item.date}</div><div className="timelineTitle">{item.title}</div>{item.body && <div className="timelineBody">{item.body}</div>}</article>)}</div></> : <div className="sectionTitle">履歴はまだありません</div>}
      <BottomNav />
    </main>
  );
}
