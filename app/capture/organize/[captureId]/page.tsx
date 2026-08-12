import Link from "next/link";
import { notFound } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { structureCapture } from "@/lib/ai-platform-core";
import { confirmKnowledgeCandidatesAction } from "./actions";

const labels = { knowledge: "パーソナリティ", schedule: "予定候補", gift: "Gift候補", unknown: "その他" };

export default async function OrganizeCapturePage({ params }: { params: Promise<{ captureId: string }> }) {
  const { captureId } = await params;
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const capture = await getCapture(captureId, workspaceId, userId);
  if (!capture) notFound();
  const structured = await structureCapture(capture.value, ownerUserId);
  const knowledge = structured.candidates.filter((candidate) => candidate.type === "knowledge");
  const schedules = structured.candidates.filter((candidate) => candidate.type === "schedule");
  const gifts = structured.candidates.filter((candidate) => candidate.type === "gift");
  const deferred = structured.candidates.filter((candidate) => !["knowledge", "schedule", "gift"].includes(candidate.type));

  return <main className="shell">
    <header className="header"><Link className="subtle" href={capture.customerId ? `/capture?customerId=${capture.customerId}` : "/capture"}>‹ 戻る</Link><span className="subtle">整理</span></header>
    <section className="hero"><h1>追加内容を確認</h1><p>元のメモはすでに保存済みです。確実なものだけ追加してください。</p></section>
    <div className="card">{capture.value}</div>
    <div className="formHint" style={{ marginTop: 10 }}>{structured.mode === "ai" ? "AIで整理しました" : "ローカル整理を使用しました"} · trace {structured.trace.traceId.slice(0, 18)}…{structured.activityId ? ` · activity ${structured.activityId}` : ""}</div>
    <form action={confirmKnowledgeCandidatesAction.bind(null, capture.id)} className="stack compactForm">
      {knowledge.length > 0 && <div className="sectionTitle">パーソナリティ候補</div>}
      {knowledge.map((candidate, index) => <label className="card row" key={`${candidate.value}-${index}`}><span>{candidate.value}</span><input type="checkbox" name="knowledge" value={candidate.value} defaultChecked /></label>)}

      {schedules.length > 0 && <div className="sectionTitle">予定候補</div>}
      {schedules.map((candidate, index) => <section className="card stack" key={`${candidate.value}-${index}`}>
        <div><div className="formHint">予定候補</div><div className="timelineTitle">{candidate.value}</div></div>
        <input type="hidden" name="scheduleValue" value={candidate.value} />
        <label className="fieldLabel" htmlFor={`schedule-${index}`}>登録する場合だけ日時を入力</label>
        <input className="searchBox" id={`schedule-${index}`} type="datetime-local" name="scheduleStartsAt" />
        <div className="formHint">日時が空欄なら登録しません。Velvetが勝手に予定化することはありません。</div>
      </section>)}

      {gifts.length > 0 && <div className="sectionTitle">Gift候補</div>}
      {gifts.map((candidate, index) => <section className="card stack" key={`${candidate.value}-${index}`}>
        <div><div className="formHint">Gift候補</div><div className="timelineTitle">{candidate.value}</div></div>
        <input type="hidden" name="giftValue" value={candidate.value} />
        {capture.customerId ? <div className="choiceRow row">
          <label className="choiceChip"><input type="radio" name="giftDirection" value="received" />もらった</label>
          <label className="choiceChip"><input type="radio" name="giftDirection" value="given" />あげた</label>
          <label className="choiceChip"><input type="radio" name="giftDirection" value="skip" defaultChecked />登録しない</label>
        </div> : <div className="formHint">顧客が選ばれていないためGiftには登録できません。</div>}
        <div className="formHint">方向はAIに決めさせません。ユーザーが選んだ場合だけ登録します。</div>
      </section>)}

      {deferred.length > 0 && <div className="sectionTitle">確認が必要な候補</div>}
      {deferred.map((candidate, index) => <div className="card" key={`${candidate.type}-${candidate.value}-${index}`}><div className="formHint">{labels[candidate.type]}</div><div>{candidate.value}</div></div>)}
      <button className="primaryButton" type="submit">確認した内容を追加</button>
    </form>
  </main>;
}
