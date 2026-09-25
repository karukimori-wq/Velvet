import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { CaptureComposerForm } from "@/components/capture-composer-form";
import { CapturePersonPicker } from "@/components/capture-person-picker";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer,listGrowthCustomersWithStatus } from "@/lib/growth-engine-customer";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { listCaptures } from "@/lib/capture-repository";
import { listRecentCaptureCustomerIds } from "@/lib/recent-capture-customers";
import { buildCustomerRecall } from "@/lib/customer-recall";
import { getRememberSections,rememberGroups } from "@/lib/remember-fields";
import { getPlanAccess } from "@/lib/plan-access";
import { listOngoingTopics } from "@/lib/ongoing-topic-repository";
import { organizeCaptureAction } from "./organize/actions";
import { suggestNextActionsFromTopic } from "@/lib/next-action-candidates";
import { createSuggestedNextAction } from "./suggested-actions";
import { listProfessionalVisits } from "@/lib/professional-visit-repository";
import { getRecallPhase,recallPresentation } from "@/lib/recall-phase";

export default async function CapturePage({searchParams}:{searchParams:Promise<{customerId?:string;saved?:string;error?:string;fromVisit?:string}>}){
  const {customerId,saved,error,fromVisit}=await searchParams;
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity();
  if(!customerId){
    const [customerResult,recentCustomerIds]=await Promise.all([listGrowthCustomersWithStatus(workspaceId,userId),listRecentCaptureCustomerIds(workspaceId,userId,6)]);
    return <main className="shell captureShell"><AppHeader title="覚える"/><section className="hero capturePickerHero"><h1>誰との時間を覚えておきますか？</h1><p>最近の人からすぐ選ぶか、名前で探せます。</p></section><CapturePersonPicker customers={customerResult.customers} recentCustomerIds={recentCustomerIds} sourceStatus={customerResult.status}/><BottomNav/></main>
  }
  const [customer,memory,captures,access,ongoingTopics,visits]=await Promise.all([getGrowthCustomer(workspaceId,userId,customerId),getCustomerMemory(workspaceId,userId,customerId),listCaptures(workspaceId,userId,customerId),getPlanAccess(ownerUserId),listOngoingTopics(workspaceId,userId,customerId),listProfessionalVisits(workspaceId,userId,customerId)]);
  const displayName=customer?.displayName??memory?.displayNameSnapshot??"お客様";
  const recall=buildCustomerRecall(memory,{maxItems:4,maxNextTopics:2,captures});
  const phase:"first"|"repeat"=((memory?.tags?.length??0)===0&&!memory?.lastInteractionSummary)?"first":"repeat";
  const rememberSections=getRememberSections(phase);
  const composerAction=organizeCaptureAction.bind(null,customerId,fromVisit);
  const recallPhase=getRecallPhase(visits); const presentation=recallPresentation(recallPhase.phase);
  const recentFieldLabels=[...new Set(captures.slice(0,12).flatMap(capture=>capture.value.split(/[。\n]/).map(part=>part.split("：")[0]?.trim()).filter(Boolean)))].slice(0,12);
  const actionCandidates=ongoingTopics.slice(0,presentation.ongoingLimit).flatMap(suggestNextActionsFromTopic).slice(0,3);
  return <main className="shell captureShell">
    <header className="velvetHeader"><Link className="menuButton actionLink" href={`/people/${encodeURIComponent(customerId)}`} aria-label={`${displayName}さんの顧客詳細へ戻る`}>‹</Link><div className="pageTitle">覚える</div><span className="headerSpacer"/></header>
    <section className="detailIdentity captureIdentity"><div className="avatar">{displayName.slice(0,1)}</div><h1>{displayName}</h1><div className="formHint">{phase==="first"?"この人のことを、少しずつ覚えていきましょう。":"今日の大切なことだけ、気軽に覚えておきましょう。"}</div></section>
    {phase==="repeat"&&(recall.items.length>0||recall.nextTopics.length>0)&&<details className="detailsCard captureRecall" open={!fromVisit}><summary>{presentation.title}</summary><div className="stack detailsBody">{recall.items.map(item=><div key={`${item.label}-${item.value}`}><div className="formHint">{item.label}{item.freshness==="aging"?" · 少し前":""}</div><div className="timelineBody">{item.value}</div></div>)}{recall.nextTopics.length>0&&<div><div className="formHint">次に話す</div>{recall.nextTopics.map(topic=><div className="timelineBody" key={topic}>・{topic}</div>)}</div>}</div></details>}
    {phase==="repeat"&&ongoingTopics.length>0&&<section className="card captureRecall"><div className="row"><strong>{presentation.title}</strong><span className="formHint">{ongoingTopics.length}件{recallPhase.visitCount>0?` · 来店${recallPhase.visitCount}回`:""}</span></div><div className="stack detailsBody">{ongoingTopics.slice(0,presentation.ongoingLimit).map(topic=><div key={topic.id}><div className="formHint">{topic.label} · {topic.state==="changed"?"変化あり":topic.state==="continued"?"継続":"NEW"}</div><div className="timelineBody">{topic.latestContent}</div></div>)}</div></section>}
    {phase==="repeat"&&actionCandidates.length>0&&<section className="card captureRecall"><strong>次につなげる</strong><div className="formHint">必要なものだけ1タップで残せます。</div><div className="stack detailsBody">{actionCandidates.map(candidate=><form key={`${candidate.sourceTopicId}-${candidate.topicId}`} action={createSuggestedNextAction.bind(null,customerId,candidate.sourceTopicId,candidate.topicId,candidate.actionType,candidate.text)}><button className="secondaryButton" type="submit">＋ {candidate.text}</button></form>)}</div></section>}
    {saved&&<div className="card successCard"><strong>覚えました</strong><div className="formHint">{saved}</div></div>}
    {error==="organize_missing"?<div className="card noticeCard"><strong>入力内容をもう一度確認してください</strong><div className="formHint">保存直後の読み込みに失敗しました。元の内容は保存されている可能性があります。顧客詳細の「出来事」を確認してから、必要な場合だけもう一度入力してください。</div></div>:error&&<div className="formError">入力内容を確認してください。</div>}
    <section className="captureFocusCard"><div className="captureFocusHeading"><strong>{phase==="first"?"この人について":"今日、覚えておくこと"}</strong><span>{phase==="first"?"人物情報から始めて、会話と次につなげます":"前回の続き、今日の話、次にすること"}</span></div><CaptureComposerForm action={composerAction} groups={rememberGroups} sections={rememberSections} knownTags={memory?.tags??[]} recentFieldLabels={recentFieldLabels} phase={phase} voiceAllowed={access.voiceCaptureAllowed} placeholder={phase==="first"?"仕事、趣味、好みなど。分かったことをそのまま入力。":"今日話したこと、変わったこと、気づいたことを入力。"}/></section>
    <Link className="captureFieldLink" href={`/remember?customerId=${encodeURIComponent(customerId)}`}>項目を選んで詳しく覚える <span>›</span></Link>
    <BottomNav/>
  </main>
}
