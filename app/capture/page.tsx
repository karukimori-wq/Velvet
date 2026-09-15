import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { CaptureChatInput } from "@/components/capture-chat-input";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer,listGrowthCustomers } from "@/lib/growth-engine-customer";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { listCaptures } from "@/lib/capture-repository";
import { buildCustomerRecall } from "@/lib/customer-recall";
import { rememberGroups } from "@/lib/remember-fields";
import { getPlanAccess } from "@/lib/plan-access";
import { organizeCaptureAction } from "./organize/actions";

export default async function CapturePage({searchParams}:{searchParams:Promise<{customerId?:string;saved?:string;error?:string;fromVisit?:string}>}){
  const {customerId,saved,error,fromVisit}=await searchParams;
  const {workspaceId,userId,ownerUserId}=await getRequestIdentity();
  if(!customerId){
    const customers=await listGrowthCustomers(workspaceId,userId);
    return <main className="shell captureShell"><AppHeader title="記録"/><section className="hero capturePickerHero"><h1>誰との時間を残しますか？</h1><p>接客の直後でも、覚えていることをそのまま数十秒で残せます。</p></section><div className="capturePersonList">{customers.map(c=>{const name=c.displayName??"お客様";return <Link className="card personRow" href={`/capture?customerId=${encodeURIComponent(c.customerId)}`} key={c.customerId}><div className="avatar">{name.slice(0,1)}</div><div className="personMain"><div className="personName">{name}</div><div className="formHint">この人との出来事を記録</div></div><span>›</span></Link>})}{customers.length===0&&<div className="card empty">登録済みのお客様がいません</div>}</div><BottomNav/></main>
  }
  const [customer,memory,captures,access]=await Promise.all([getGrowthCustomer(workspaceId,userId,customerId),getCustomerMemory(workspaceId,userId,customerId),listCaptures(workspaceId,userId,customerId),getPlanAccess(ownerUserId)]);
  const displayName=customer?.displayName??memory?.displayNameSnapshot??"お客様";
  const recall=buildCustomerRecall(memory,{maxItems:4,maxNextTopics:2,captures});
  const phase:"first"|"repeat"=((memory?.tags?.length??0)===0&&!memory?.lastInteractionSummary)?"first":"repeat";
  return <main className="shell captureShell">
    <header className="velvetHeader"><Link className="menuButton actionLink" href={`/people/${encodeURIComponent(customerId)}`} aria-label={`${displayName}さんの顧客詳細へ戻る`}>‹</Link><div className="pageTitle">記録</div><span className="headerSpacer"/></header>
    <section className="detailIdentity captureIdentity"><div className="avatar">{displayName.slice(0,1)}</div><h1>{displayName}</h1><div className="formHint">{phase==="first"?"この人のことを、少しずつ覚えていきましょう。":"今日の大切なことだけ、気軽に残しましょう。"}</div></section>
    {phase==="repeat"&&(recall.items.length>0||recall.nextTopics.length>0)&&<details className="detailsCard captureRecall" open={!fromVisit}><summary>前回を思い出す</summary><div className="stack detailsBody">{recall.items.map(item=><div key={`${item.label}-${item.value}`}><div className="formHint">{item.label}{item.freshness==="aging"?" · 少し前":""}</div><div className="timelineBody">{item.value}</div></div>)}{recall.nextTopics.length>0&&<div><div className="formHint">次に話す</div>{recall.nextTopics.map(topic=><div className="timelineBody" key={topic}>・{topic}</div>)}</div>}</div></details>}
    {saved&&<div className="card successCard"><strong>保存しました</strong><div className="formHint">{saved}</div></div>}
    {error==="organize_missing"?<div className="card noticeCard"><strong>入力内容をもう一度確認してください</strong><div className="formHint">一時保存が切れたため、もう一度入力して「整理して確認」を押してください。</div></div>:error&&<div className="formError">入力内容を確認してください。</div>}
    <section className="captureFocusCard"><div className="captureFocusHeading"><strong>今日の記録</strong><span>短いメモでも大丈夫です</span></div><form action={organizeCaptureAction.bind(null,customerId,fromVisit)} className="stack captureForm"><CaptureChatInput groups={rememberGroups} knownTags={memory?.tags??[]} phase={phase} voiceAllowed={access.voiceCaptureAllowed} placeholder={phase==="first"?"仕事、趣味、好みなど。分かったことをそのまま入力。":"今日話したこと、変わったこと、気づいたことを入力。"}/><button className="primaryButton" type="submit">整理して確認</button></form></section>
    <Link className="captureFieldLink" href={`/remember?customerId=${encodeURIComponent(customerId)}`}>項目を選んで詳しく入力 <span>›</span></Link>
    <BottomNav/>
  </main>
}
