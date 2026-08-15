import Link from "next/link";
import { notFound } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { structureCapture } from "@/lib/ai-platform-core";
import { confirmKnowledgeCandidatesAction } from "./actions";

const labels = { knowledge: "新しく分かったこと", preference: "好み", next_topic: "次回話題", schedule: "予定", gift: "贈り物", unknown: "その他" };

export default async function OrganizeCapturePage({ params, searchParams }: { params: Promise<{ captureId: string }>; searchParams: Promise<{ fromVisit?: string }> }) {
  const { captureId } = await params;
  const { fromVisit } = await searchParams;
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const capture = await getCapture(captureId, workspaceId, userId);
  if (!capture) notFound();
  const structured = await structureCapture(capture.value, ownerUserId);
  const knowledge = structured.candidates.filter((candidate) => candidate.type === "knowledge");
  const preferences = structured.candidates.filter((candidate) => candidate.type === "preference");
  const nextTopics = structured.candidates.filter((candidate) => candidate.type === "next_topic");
  const schedules = structured.candidates.filter((candidate) => candidate.type === "schedule");
  const gifts = structured.candidates.filter((candidate) => candidate.type === "gift");
  const deferred = structured.candidates.filter((candidate) => !["knowledge", "preference", "next_topic", "schedule", "gift"].includes(candidate.type));
  const candidateCount = structured.candidates.length;
  const backParams = new URLSearchParams();
  if (capture.customerId) backParams.set("customerId", capture.customerId);
  if (fromVisit) backParams.set("fromVisit", fromVisit);
  const backHref = backParams.size ? `/capture?${backParams.toString()}` : "/capture";

  return <main className="shell">
    <header className="header"><Link className="subtle" href={backHref}>‹ 戻る</Link><span className="subtle">確認</span></header>
    <section className="hero"><h1>{candidateCount ? "この内容で残しますか？" : "会話を保存しました"}</h1><p>会話そのものはすでに保存されています。追加で覚えておきたい内容だけ確認してください。</p></section>
    <details className="detailsCard"><summary>話した内容を見る</summary><div className="detailsBody timelineBody">{capture.value}</div></details>

    <form action={confirmKnowledgeCandidatesAction.bind(null, capture.id, fromVisit)} className="stack compactForm">
      {knowledge.length > 0 && <><div className="sectionTitle">新しく分かったこと</div><div className="chips reviewChips">{knowledge.map((candidate,index)=><label className="choiceChip reviewChoice" key={`${candidate.value}-${index}`}><input type="checkbox" name="knowledge" value={candidate.value} defaultChecked/><span>{candidate.value}</span></label>)}</div></>}
      {preferences.length > 0 && <><div className="sectionTitle">好み</div><div className="chips reviewChips">{preferences.map((candidate,index)=><label className="choiceChip reviewChoice" key={`${candidate.value}-${index}`}><input type="checkbox" name="preference" value={candidate.value} defaultChecked/><span>{candidate.value}</span></label>)}</div></>}
      {nextTopics.length > 0 && <><div className="sectionTitle">次に話したいこと</div><div className="formHint">複数選べます。次回は最大3件を優先表示します。</div><div className="chips reviewChips">{nextTopics.map((candidate,index)=><label className="choiceChip reviewChoice" key={`${candidate.value}-${index}`}><input type="checkbox" name="nextTopic" value={candidate.value} defaultChecked/><span>{candidate.value}</span></label>)}</div></>}
      {schedules.length > 0 && <><div className="sectionTitle">予定に残すなら日時だけ</div>{schedules.map((candidate,index)=><div className="reviewRow" key={`${candidate.value}-${index}`}><input type="hidden" name="scheduleValue" value={candidate.value}/><div className="reviewLabel">{candidate.value}</div><input className="compactDateInput" aria-label={`${candidate.value}の日時`} type="datetime-local" name="scheduleStartsAt"/></div>)}</>}
      {gifts.length > 0 && <><div className="sectionTitle">贈り物</div><input type="hidden" name="giftCount" value={gifts.length}/>{gifts.map((candidate,index)=><div className="reviewRow reviewGiftRow" key={`${candidate.value}-${index}`}><input type="hidden" name={`giftValue-${index}`} value={candidate.value}/><div className="reviewLabel">{candidate.value}</div>{capture.customerId?<div className="miniChoices"><label className="choiceChip"><input type="radio" name={`giftDirection-${index}`} value="received"/><span>もらった</span></label><label className="choiceChip"><input type="radio" name={`giftDirection-${index}`} value="given"/><span>あげた</span></label><label className="choiceChip"><input type="radio" name={`giftDirection-${index}`} value="skip" defaultChecked/><span>登録しない</span></label></div>:null}</div>)}</>}
      {deferred.length > 0 && <details className="detailsCard"><summary>その他 {deferred.length}件</summary><div className="stack detailsBody">{deferred.map((candidate,index)=><div className="row" key={`${candidate.type}-${candidate.value}-${index}`}><span>{candidate.value}</span><span className="formHint">{labels[candidate.type]}</span></div>)}</div></details>}
      <div className="stickyConfirm stack"><button className="primaryButton" type="submit" name="submitIntent" value="done">保存して終わる</button><button className="secondaryButton" type="submit" name="submitIntent" value="continue">続けて記録する</button></div>
    </form>
  </main>;
}
