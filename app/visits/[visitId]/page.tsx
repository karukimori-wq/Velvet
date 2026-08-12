import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPersonStore, listPeopleStore } from "@/lib/person-store";
import { getVisit } from "@/lib/visit-repository";
import { addParticipantAction, endVisitAction, quickUpdateVisitAction, updateVisitAction } from "../actions";

const paymentLabels: Record<string, string> = {
  cash: "現金",
  card: "カード",
  qr: "QR",
  receivable: "売掛",
  other: "その他",
};
const contextLabels: Record<string, string> = {
  solo: "個人",
  group: "複数人",
  entertainment: "接待",
  business: "仕事",
  accompaniment: "同伴",
  other: "その他",
};

const seatingChoices = ["新規", "指名", "場内指名", "ヘルプ", "同伴"];
const contextChoices = [["solo", "個人"], ["group", "複数人"], ["entertainment", "接待"], ["business", "仕事"], ["accompaniment", "同伴"], ["other", "その他"]] as const;
const paymentChoices = [["cash", "現金"], ["card", "カード"], ["qr", "QR"], ["receivable", "売掛"], ["other", "その他"]] as const;

export default async function ActiveVisitPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const { ownerUserId } = await getRequestIdentity();
  const visit = await getVisit(visitId, ownerUserId);
  if (!visit) notFound();

  const participants = (await Promise.all(visit.participantIds.map((id) => getPersonStore(id, ownerUserId)))).filter(Boolean);
  const availablePeople = (await listPeopleStore(ownerUserId)).filter((person) => !visit.participantIds.includes(person.id));
  const start = new Date(visit.startedAt);
  const elapsedMinutes = visit.endedAt
    ? visit.durationMinutes ?? 0
    : Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));

  return (
    <main className="shell">
      <header className="header">
        <Link className="subtle" href={`/people/${visit.participantIds[0]}`}>‹ 戻る</Link>
        <span className="subtle">来店中</span>
      </header>

      <section className="hero">
        <h1>{participants.map((person) => person?.name).join("・") || "来店"}</h1>
        <p>{start.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}〜 · {elapsedMinutes}分</p>
      </section>

      {(visit.seatingReason || visit.visitContext || visit.paymentMethod || typeof visit.salesAmount === "number") && <>
        <div className="sectionTitle">入力済み</div>
        <div className="chips">
          {visit.seatingReason && <span className="chip">{visit.seatingReason}</span>}
          {visit.visitContext && <span className="chip">{contextLabels[visit.visitContext]}</span>}
          {visit.paymentMethod && <span className="chip">{paymentLabels[visit.paymentMethod]}</span>}
          {typeof visit.salesAmount === "number" && <span className="chip">¥{visit.salesAmount.toLocaleString("ja-JP")}</span>}
        </div>
      </>}

      {!visit.endedAt && (
        <>
          <div className="sectionTitle">着席理由 · 1タップ</div>
          <div className="chips choiceRow">
            {seatingChoices.map((value) => (
              <form action={quickUpdateVisitAction.bind(null, visit.id, "seatingReason", value)} key={value}>
                <button className={`choiceChip ${visit.seatingReason === value ? "activeAction" : ""}`} type="submit">{value}</button>
              </form>
            ))}
          </div>

          <div className="sectionTitle">利用形態 · 1タップ</div>
          <div className="chips choiceRow">
            {contextChoices.map(([value, label]) => (
              <form action={quickUpdateVisitAction.bind(null, visit.id, "visitContext", value)} key={value}>
                <button className={`choiceChip ${visit.visitContext === value ? "activeAction" : ""}`} type="submit">{label}</button>
              </form>
            ))}
          </div>

          <div className="sectionTitle">支払方法 · 1タップ</div>
          <div className="chips choiceRow">
            {paymentChoices.map(([value, label]) => (
              <form action={quickUpdateVisitAction.bind(null, visit.id, "paymentMethod", value)} key={value}>
                <button className={`choiceChip ${visit.paymentMethod === value ? "activeAction" : ""}`} type="submit">{label}</button>
              </form>
            ))}
          </div>

          <details className="detailsCard">
            <summary>売上を入力</summary>
            <form action={updateVisitAction} className="inlineForm detailsBody">
              <input type="hidden" name="visitId" value={visit.id} />
              <input className="searchBox" name="salesAmount" inputMode="numeric" placeholder="金額" defaultValue={visit.salesAmount ?? ""} />
              <button className="secondaryButton" type="submit">保存</button>
            </form>
          </details>

          {availablePeople.length > 0 && (
            <details className="detailsCard">
              <summary>一緒に来た人を追加</summary>
              <form action={addParticipantAction} className="inlineForm detailsBody">
                <input type="hidden" name="visitId" value={visit.id} />
                <select className="selectBox" name="personId" defaultValue="">
                  <option value="" disabled>選択</option>
                  {availablePeople.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
                <button className="secondaryButton" type="submit">追加</button>
              </form>
            </details>
          )}

          <div className="sectionTitle">終了</div>
          <form action={endVisitAction}>
            <input type="hidden" name="visitId" value={visit.id} />
            <button className="dangerButton" type="submit">退店</button>
          </form>
        </>
      )}

      {visit.endedAt && <div className="card">退店済み · {visit.durationMinutes ?? 0}分</div>}
      <BottomNav />
    </main>
  );
}
