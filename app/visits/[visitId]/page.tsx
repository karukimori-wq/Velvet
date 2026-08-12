import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPersonStore, listPeopleStore } from "@/lib/person-store";
import { getVisit } from "@/lib/visit-repository";
import { addParticipantAction, endVisitAction, quickUpdateVisitAction, updateVisitAction } from "../actions";

const paymentLabels: Record<string, string> = { cash: "現金", card: "カード", qr: "QR", receivable: "売掛", other: "その他" };
const contextLabels: Record<string, string> = { solo: "個人", group: "複数人", entertainment: "接待", business: "仕事", accompaniment: "同伴", other: "その他" };
const nominationLabels: Record<string, string> = { main: "本指名", in_store: "場内指名", help: "ヘルプ", free: "フリー", other: "その他" };
const receivableLabels: Record<string, string> = { open: "未回収", partial: "一部回収", paid: "回収済" };

const seatingChoices = ["新規", "指名", "場内指名", "ヘルプ", "同伴"];
const contextChoices = [["solo", "個人"], ["group", "複数人"], ["entertainment", "接待"], ["business", "仕事"], ["accompaniment", "同伴"], ["other", "その他"]] as const;
const paymentChoices = [["cash", "現金"], ["card", "カード"], ["qr", "QR"], ["receivable", "売掛"], ["other", "その他"]] as const;
const nominationChoices = [["main", "本指名"], ["in_store", "場内指名"], ["help", "ヘルプ"], ["free", "フリー"]] as const;
const receivableChoices = [["open", "未回収"], ["partial", "一部回収"], ["paid", "回収済"]] as const;

export default async function ActiveVisitPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const { ownerUserId } = await getRequestIdentity();
  const visit = await getVisit(visitId, ownerUserId);
  if (!visit) notFound();

  const participants = (await Promise.all(visit.participantIds.map((id) => getPersonStore(id, ownerUserId)))).filter(Boolean);
  const availablePeople = (await listPeopleStore(ownerUserId)).filter((person) => !visit.participantIds.includes(person.id));
  const start = new Date(visit.startedAt);
  const elapsedMinutes = visit.endedAt ? visit.durationMinutes ?? 0 : Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));

  return (
    <main className="shell">
      <header className="header"><Link className="subtle" href={`/people/${visit.participantIds[0]}`}>‹ 戻る</Link><span className="subtle">来店中</span></header>
      <section className="hero"><h1>{participants.map((person) => person?.name).join("・") || "来店"}</h1><p>{start.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}〜 · {elapsedMinutes}分</p></section>

      {(visit.seatingReason || visit.visitContext || visit.paymentMethod || visit.nominationType || typeof visit.salesAmount === "number" || typeof visit.receivableAmount === "number") && <>
        <div className="sectionTitle">入力済み</div>
        <div className="chips">
          {visit.nominationType && <span className="chip">{nominationLabels[visit.nominationType]}</span>}
          {visit.seatingReason && <span className="chip">{visit.seatingReason}</span>}
          {visit.visitContext && <span className="chip">{contextLabels[visit.visitContext]}</span>}
          {visit.paymentMethod && <span className="chip">{paymentLabels[visit.paymentMethod]}</span>}
          {typeof visit.salesAmount === "number" && <span className="chip">¥{visit.salesAmount.toLocaleString("ja-JP")}</span>}
          {typeof visit.receivableAmount === "number" && <span className="chip">売掛 ¥{visit.receivableAmount.toLocaleString("ja-JP")}</span>}
          {visit.receivableStatus && <span className="chip">{receivableLabels[visit.receivableStatus]}</span>}
          {typeof visit.drinkCount === "number" && visit.drinkCount > 0 && <span className="chip">ドリンク {visit.drinkCount}</span>}
          {typeof visit.bottleCount === "number" && visit.bottleCount > 0 && <span className="chip">ボトル {visit.bottleCount}</span>}
        </div>
      </>}

      {!visit.endedAt && <>
        <div className="sectionTitle">指名 · 1タップ</div>
        <div className="chips choiceRow">{nominationChoices.map(([value, label]) => <form action={quickUpdateVisitAction.bind(null, visit.id, "nominationType", value)} key={value}><button className={`choiceChip ${visit.nominationType === value ? "activeAction" : ""}`} type="submit">{label}</button></form>)}</div>

        <div className="sectionTitle">着席理由 · 1タップ</div>
        <div className="chips choiceRow">{seatingChoices.map((value) => <form action={quickUpdateVisitAction.bind(null, visit.id, "seatingReason", value)} key={value}><button className={`choiceChip ${visit.seatingReason === value ? "activeAction" : ""}`} type="submit">{value}</button></form>)}</div>

        <div className="sectionTitle">利用形態 · 1タップ</div>
        <div className="chips choiceRow">{contextChoices.map(([value, label]) => <form action={quickUpdateVisitAction.bind(null, visit.id, "visitContext", value)} key={value}><button className={`choiceChip ${visit.visitContext === value ? "activeAction" : ""}`} type="submit">{label}</button></form>)}</div>

        <div className="sectionTitle">支払方法 · 1タップ</div>
        <div className="chips choiceRow">{paymentChoices.map(([value, label]) => <form action={quickUpdateVisitAction.bind(null, visit.id, "paymentMethod", value)} key={value}><button className={`choiceChip ${visit.paymentMethod === value ? "activeAction" : ""}`} type="submit">{label}</button></form>)}</div>

        {visit.paymentMethod === "receivable" && <>
          <div className="sectionTitle">売掛状況 · 1タップ</div>
          <div className="chips choiceRow">{receivableChoices.map(([value, label]) => <form action={quickUpdateVisitAction.bind(null, visit.id, "receivableStatus", value)} key={value}><button className={`choiceChip ${visit.receivableStatus === value ? "activeAction" : ""}`} type="submit">{label}</button></form>)}</div>
        </>}

        <details className="detailsCard">
          <summary>売上・ドリンク・ボトルを入力</summary>
          <form action={updateVisitAction} className="stack detailsBody">
            <input type="hidden" name="visitId" value={visit.id} />
            <input className="searchBox" name="salesAmount" inputMode="numeric" placeholder="売上金額" defaultValue={visit.salesAmount ?? ""} />
            {visit.paymentMethod === "receivable" && <input className="searchBox" name="receivableAmount" inputMode="numeric" placeholder="売掛額" defaultValue={visit.receivableAmount ?? ""} />}
            <div className="inlineForm"><input className="searchBox" name="drinkCount" inputMode="numeric" placeholder="ドリンク本数" defaultValue={visit.drinkCount ?? ""} /><input className="searchBox" name="bottleCount" inputMode="numeric" placeholder="ボトル本数" defaultValue={visit.bottleCount ?? ""} /></div>
            <input className="searchBox" name="bottleNote" placeholder="ボトル名など（任意）" defaultValue={visit.bottleNote ?? ""} />
            <button className="secondaryButton" type="submit">保存</button>
          </form>
        </details>

        {availablePeople.length > 0 && <details className="detailsCard"><summary>一緒に来た人を追加</summary><form action={addParticipantAction} className="inlineForm detailsBody"><input type="hidden" name="visitId" value={visit.id} /><select className="selectBox" name="personId" defaultValue=""><option value="" disabled>選択</option>{availablePeople.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select><button className="secondaryButton" type="submit">追加</button></form></details>}

        <div className="sectionTitle">終了</div><form action={endVisitAction}><input type="hidden" name="visitId" value={visit.id} /><button className="dangerButton" type="submit">退店</button></form>
      </>}

      {visit.endedAt && <div className="card">退店済み · {visit.durationMinutes ?? 0}分</div>}
      <BottomNav />
    </main>
  );
}
