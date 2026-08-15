import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getProfessionalVisit } from "@/lib/professional-visit-repository";
import { endVisitAction, quickUpdateVisitAction, updateVisitAction } from "../actions";

const seatingChoices = ["新規", "指名", "場内指名", "ヘルプ", "同伴", "フリー"];
const contextChoices = ["個人", "複数人", "接待", "仕事", "同伴", "その他"];

export default async function ActiveVisitPage({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  const identity = await getRequestIdentity();
  const visit = await getProfessionalVisit(visitId, identity.workspaceId, identity.userId);
  if (!visit) notFound();
  const customer = await getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId: visit.customerId, reservationId: visit.reservationId, visitScheduleId: visit.visitScheduleId });
  const start = new Date(visit.visitedAt);
  const elapsedMinutes = visit.endedAt ? visit.durationMinutes ?? 0 : Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000));

  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${visit.customerId}`}>‹ 戻る</Link><span className="subtle">接客中</span></header>
    <section className="hero"><h1>{customer.displayName || "お客様"}</h1><p>{start.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}〜 · {elapsedMinutes}分</p></section>
    {(visit.seatingReason || visit.serviceContext) && <><div className="sectionTitle">入力済み</div><div className="chips">{visit.seatingReason && <span className="chip">{visit.seatingReason}</span>}{visit.serviceContext && <span className="chip">{visit.serviceContext}</span>}</div></>}
    {!visit.endedAt && <>
      <div className="sectionTitle">着席理由 · 1タップ</div><div className="chips choiceRow">{seatingChoices.map((value) => <form action={quickUpdateVisitAction.bind(null, visit.id, "seatingReason", value)} key={value}><button className={`choiceChip ${visit.seatingReason === value ? "activeAction" : ""}`} type="submit">{value}</button></form>)}</div>
      <div className="sectionTitle">利用形態 · 1タップ</div><div className="chips choiceRow">{contextChoices.map((value) => <form action={quickUpdateVisitAction.bind(null, visit.id, "serviceContext", value)} key={value}><button className={`choiceChip ${visit.serviceContext === value ? "activeAction" : ""}`} type="submit">{value}</button></form>)}</div>
      <details className="detailsCard"><summary>接客中にメモする</summary><form action={updateVisitAction} className="stack detailsBody"><input type="hidden" name="visitId" value={visit.id}/><textarea className="searchBox" name="conversationMemo" placeholder="会話メモ" defaultValue={visit.conversationMemo ?? ""}/><textarea className="searchBox" name="preferenceMemo" placeholder="好み" defaultValue={visit.preferenceMemo ?? ""}/><textarea className="searchBox" name="cautionMemo" placeholder="注意点" defaultValue={visit.cautionMemo ?? ""}/><textarea className="searchBox" name="nextActionMemo" placeholder="次に話したいこと" defaultValue={visit.nextActionMemo ?? ""}/><textarea className="searchBox" name="summary" placeholder="今日の対応をひとこと" defaultValue={visit.summary ?? ""}/><button className="secondaryButton" type="submit">保存</button></form></details>
      <div className="sectionTitle">接客が終わったら</div><form action={endVisitAction}><input type="hidden" name="visitId" value={visit.id}/><button className="dangerButton" type="submit">退店して、今日の会話を残す</button></form>
    </>}
    {visit.endedAt && <div className="card">退店済み · {visit.durationMinutes ?? 0}分</div>}
    <BottomNav />
  </main>;
}
