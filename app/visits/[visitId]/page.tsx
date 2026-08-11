import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getPerson, listPeople } from "@/lib/demo-data";
import { getVisit } from "@/lib/visit-repository";
import { addParticipantAction, endVisitAction, updateVisitAction } from "../actions";

const paymentLabels: Record<string, string> = {
  cash: "現金",
  card: "カード",
  qr: "QR",
  receivable: "売掛",
  other: "その他",
};

export default async function ActiveVisitPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const visit = getVisit(visitId);
  if (!visit) notFound();

  const participants = visit.participantIds.map((id) => getPerson(id)).filter(Boolean);
  const availablePeople = listPeople().filter((person) => !visit.participantIds.includes(person.id));
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

      <div className="sectionTitle">入力済み</div>
      <div className="chips">
        {visit.seatingReason && <span className="chip">{visit.seatingReason}</span>}
        {visit.paymentMethod && <span className="chip">{paymentLabels[visit.paymentMethod]}</span>}
        {typeof visit.salesAmount === "number" && <span className="chip">¥{visit.salesAmount.toLocaleString("ja-JP")}</span>}
        {!visit.seatingReason && !visit.paymentMethod && typeof visit.salesAmount !== "number" && <span className="subtle">まだありません</span>}
      </div>

      {!visit.endedAt && (
        <>
          <div className="sectionTitle">クイック入力</div>
          <form action={updateVisitAction} className="stack">
            <input type="hidden" name="visitId" value={visit.id} />
            <div className="chips choiceRow">
              {[
                ["新規", "新規"],
                ["指名", "指名"],
                ["場内指名", "場内指名"],
                ["ヘルプ", "ヘルプ"],
                ["同伴", "同伴"],
              ].map(([value, label]) => (
                <label className="choiceChip" key={value}><input type="radio" name="seatingReason" value={value} defaultChecked={visit.seatingReason === value} />{label}</label>
              ))}
            </div>
            <div className="chips choiceRow">
              {[
                ["cash", "現金"], ["card", "カード"], ["qr", "QR"], ["receivable", "売掛"], ["other", "その他"],
              ].map(([value, label]) => (
                <label className="choiceChip" key={value}><input type="radio" name="paymentMethod" value={value} defaultChecked={visit.paymentMethod === value} />{label}</label>
              ))}
            </div>
            <input className="searchBox" name="salesAmount" inputMode="numeric" placeholder="売上（任意）" defaultValue={visit.salesAmount ?? ""} />
            <button className="primaryButton" type="submit">反映</button>
          </form>

          {availablePeople.length > 0 && (
            <>
              <div className="sectionTitle">一緒に来た人を追加</div>
              <form action={addParticipantAction} className="inlineForm">
                <input type="hidden" name="visitId" value={visit.id} />
                <select className="selectBox" name="personId" defaultValue="">
                  <option value="" disabled>選択</option>
                  {availablePeople.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
                <button className="secondaryButton" type="submit">追加</button>
              </form>
            </>
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
