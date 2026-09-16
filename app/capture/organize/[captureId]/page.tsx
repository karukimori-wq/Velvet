import Link from "next/link";
import { redirect } from "next/navigation";
import { getCapture } from "@/lib/capture-repository";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { structureCapture } from "@/lib/ai-platform-core";
import { getPlanAccess, isWithinHistoryWindow } from "@/lib/plan-access";
import { rememberGroups } from "@/lib/remember-fields";
import { confirmKnowledgeCandidatesAction } from "./actions";

const labels = { knowledge: "新しく分かったこと", preference: "好み", next_topic: "次回話題", schedule: "予定", gift: "贈り物", memory_field: "人物情報", unknown: "その他" };
const fieldMap = new Map(rememberGroups.flatMap(group => group.fields.map(field => [field.label, { group: group.title, label: field.label }] as const)));

function extractMemoryTags(value: string) {
  const found: Array<{ group: string; label: string; value: string; tag: string }> = [];
  for (const part of value.split(/[。\n]+/).map(v => v.trim()).filter(Boolean)) {
    const index = part.indexOf("：");
    if (index < 1) continue;
    const label = part.slice(0, index).trim();
    const content = part.slice(index + 1).trim();
    const field = fieldMap.get(label);
    if (field && content) found.push({ ...field, value: content, tag: `${label}：${content}` });
  }
  return Array.from(new Map(found.map(item => [item.tag, item])).values());
}

async function readCaptureWithRetry(captureId: string, workspaceId: string, userId: string) {
  for (const delay of [0, 80, 220]) {
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    const capture = await getCapture(captureId, workspaceId, userId);
    if (capture) return capture;
  }
  return undefined;
}

export default async function OrganizeCapturePage({ params, searchParams }: { params: Promise<{ captureId: string }>; searchParams: Promise<{ fromVisit?: string; customerId?: string }> }) {
  const { captureId } = await params;
  const { fromVisit, customerId } = await searchParams;
  const { workspaceId, userId, ownerUserId } = await getRequestIdentity();
  const [capture, access] = await Promise.all([
    readCaptureWithRetry(captureId, workspaceId, userId),
    getPlanAccess(ownerUserId),
  ]);
  if (!capture) {
    const recovery = new URLSearchParams();
    if (customerId) recovery.set("customerId", customerId);
    if (fromVisit) recovery.set("fromVisit", fromVisit);
    recovery.set("error", "organize_missing");
    redirect(`/capture?${recovery.toString()}`);
  }
  if (!isWithinHistoryWindow(capture.createdAt, access)) redirect("/plans?reason=history_window");

  const structured = await structureCapture(capture.value, ownerUserId);
  const explicit = extractMemoryTags(capture.value);
  const explicitLabels = new Set(explicit.map(item => item.label));
  const aiFields = structured.candidates
    .filter(c => c.type === "memory_field" && c.fieldLabel && fieldMap.has(c.fieldLabel) && !explicitLabels.has(c.fieldLabel))
    .map(c => {
      const field = fieldMap.get(c.fieldLabel!)!;
      return { ...field, value: c.value, tag: `${c.fieldLabel}：${c.value}` };
    });
  const memoryTags = Array.from(new Map([...explicit, ...aiFields].map(item => [item.tag, item])).values());
  const candidates = structured.candidates.filter(c => c.type !== "memory_field");
  const knowledge = candidates.filter(c => c.type === "knowledge");
  const preferences = candidates.filter(c => c.type === "preference");
  const nextTopics = candidates.filter(c => c.type === "next_topic");
  const schedules = candidates.filter(c => c.type === "schedule");
  const gifts = candidates.filter(c => c.type === "gift");
  const deferred = candidates.filter(c => !["knowledge", "preference", "next_topic", "schedule", "gift"].includes(c.type));
  const candidateCount = memoryTags.length + candidates.length;
  const backParams = new URLSearchParams();
  if (capture.customerId) backParams.set("customerId", capture.customerId);
  if (fromVisit) backParams.set("fromVisit", fromVisit);
  const backHref = backParams.size ? `/capture?${backParams}` : "/capture";

  return <main className="shell captureShell organizeShell">
    <header className="velvetHeader">
      <Link className="menuButton actionLink" href={backHref} aria-label="記録入力へ戻る">‹</Link>
      <div className="pageTitle">確認</div>
      <span className="headerSpacer" />
    </header>

    <section className="organizeHero">
      <div className="organizeStep">あと一歩</div>
      <h1>{candidateCount ? "この内容で覚えますか？" : "会話を覚えました"}</h1>
      <p>{candidateCount ? "Velvetが整理しました。違うものだけチェックを外せばOKです。" : "入力した内容は保存されています。"}</p>
    </section>

    <details className="detailsCard organizeRawInput">
      <summary>入力した内容を見る</summary>
      <div className="detailsBody timelineBody">{capture.value}</div>
    </details>

    <form action={confirmKnowledgeCandidatesAction.bind(null, capture.id, fromVisit)} className="stack compactForm organizeReviewForm">
      {memoryTags.length > 0 && <section className="organizeReviewSection">
        <div className="sectionTitle">この人について</div>
        <div className="formHint">人物情報として残す内容です。</div>
        <div className="memoryReviewList">{memoryTags.map(item => <label className="card memoryReviewItem" key={item.tag}><input type="checkbox" name="memoryTag" value={item.tag} defaultChecked /><div><div className="formHint">{item.group} › {item.label}</div><strong>{item.value}</strong></div><span className="memoryDestination">覚える</span></label>)}</div>
      </section>}

      {knowledge.length > 0 && <section className="organizeReviewSection"><div className="sectionTitle">会話から分かったこと</div><div className="formHint">人物情報としてそのまま残します。</div><div className="chips reviewChips">{knowledge.map((c, i) => <label className="choiceChip reviewChoice" key={`${c.value}-${i}`}><input type="checkbox" name="knowledge" value={c.value} defaultChecked /><span>{c.value}</span></label>)}</div></section>}
      {preferences.length > 0 && <section className="organizeReviewSection"><div className="sectionTitle">好み</div><div className="chips reviewChips">{preferences.map((c, i) => <label className="choiceChip reviewChoice" key={`${c.value}-${i}`}><input type="checkbox" name="preference" value={c.value} defaultChecked /><span>{c.value}</span></label>)}</div></section>}
      {nextTopics.length > 0 && <section className="organizeReviewSection"><div className="sectionTitle">次に話したいこと</div><div className="chips reviewChips">{nextTopics.map((c, i) => <label className="choiceChip reviewChoice" key={`${c.value}-${i}`}><input type="checkbox" name="nextTopic" value={c.value} defaultChecked /><span>{c.value}</span></label>)}</div></section>}
      {schedules.length > 0 && <section className="organizeReviewSection"><div className="sectionTitle">予定</div>{schedules.map((c, i) => <div className="reviewRow" key={`${c.value}-${i}`}><input type="hidden" name="scheduleValue" value={c.value} /><div className="reviewLabel">{c.value}</div><input className="compactDateInput" type="datetime-local" name="scheduleStartsAt" aria-label={`${c.value}の日時`} /></div>)}</section>}
      {gifts.length > 0 && <section className="organizeReviewSection"><div className="sectionTitle">贈り物</div><input type="hidden" name="giftCount" value={gifts.length} />{gifts.map((c, i) => <div className="reviewRow reviewGiftRow" key={`${c.value}-${i}`}><input type="hidden" name={`giftValue-${i}`} value={c.value} /><div className="reviewLabel">{c.value}</div>{capture.customerId && <div className="miniChoices"><label className="choiceChip"><input type="radio" name={`giftDirection-${i}`} value="received" /><span>もらった</span></label><label className="choiceChip"><input type="radio" name={`giftDirection-${i}`} value="given" /><span>あげた</span></label><label className="choiceChip"><input type="radio" name={`giftDirection-${i}`} value="skip" defaultChecked /><span>登録しない</span></label></div>}</div>)}</section>}
      {deferred.length > 0 && <details className="detailsCard"><summary>その他 {deferred.length}件</summary><div className="stack detailsBody">{deferred.map((c, i) => <div className="row" key={`${c.type}-${c.value}-${i}`}><span>{c.value}</span><span className="formHint">{labels[c.type]}</span></div>)}</div></details>}

      <div className="stickyConfirm organizeConfirm">
        <button className="primaryButton" type="submit" name="submitIntent" value="done">この内容で覚える</button>
        <button className="secondaryButton" type="submit" name="submitIntent" value="continue">保存して、続けて覚える</button>
        <Link className="organizeBackLink" href={backHref}>入力を直す</Link>
      </div>
    </form>
  </main>;
}
