import Link from "next/link";
import { MessageDraftCtaInput } from "@/components/message-draft-cta-input";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getMessageDraftStatus } from "@/lib/message-draft";
import { requestMessageDraftAction } from "./actions";

export default async function MessageDraftPage({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { customerId } = await params; const query = await searchParams; const identity = await getRequestIdentity();
  const [customer, memory] = await Promise.all([getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }), getCustomerMemory(identity.workspaceId, identity.userId, customerId)]);
  const integration = getMessageDraftStatus(); const value=(key:string)=>typeof query[key]==="string"?query[key] as string:undefined; const resultStatus=value("status"); const draftText=value("draftText");
  const displayName=customer.displayName||memory?.displayNameSnapshot||"お客様";
  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ {displayName}</Link><span className="subtle">連絡文案</span></header>
    <section className="hero"><h1>{displayName}さんへの文案</h1><p>送りたい雰囲気だけ選べば、文案を作れます。</p></section>
    {!integration.configured&&<div className="card noticeCard"><div className="timelineTitle">文案作成は準備中です</div><div className="timelineBody">接続設定が完了すると、この画面から文案を作れるようになります。</div></div>}
    <form action={requestMessageDraftAction.bind(null,customerId)} className="stack compactForm">
      <label className="fieldLabel" htmlFor="channel">どこで送る？</label><select className="selectBox" id="channel" name="channel" defaultValue="line"><option value="line">LINE</option><option value="instagram">InstagramのDM</option><option value="email">メール</option><option value="sms">SMS</option><option value="other">その他</option></select>
      <label className="fieldLabel" htmlFor="purpose">何の連絡？</label><select className="selectBox" id="purpose" name="purpose" defaultValue="follow_up"><option value="follow_up">近況を聞く</option><option value="thanks">お礼</option><option value="visit_invite">来店のお誘い</option><option value="birthday">誕生日</option><option value="other">その他</option></select>
      <label className="fieldLabel" htmlFor="tone">どんな感じ？</label><select className="selectBox" id="tone" name="tone" defaultValue="natural"><option value="natural">いつも通り</option><option value="casual">くだけた感じ</option><option value="polite">丁寧</option><option value="warm">親しみを込める</option></select>
      <MessageDraftCtaInput suggestion={memory?.nextTopicHint}/>
      <div className="formHint">接客メモ全文や売上・支払い情報は文案作成には使いません。</div>
      <button className="primaryButton" type="submit" disabled={!integration.configured}>文案を作る</button>
    </form>
    {resultStatus&&<div className="sectionTitle">できた文案</div>}
    {resultStatus&&<section className="card stack"><div className="timelineTitle">{resultStatus==="success"?"このまま使えます":resultStatus==="warning"?"現在文案を作れません":"作成できませんでした"}</div>{draftText&&<div className="timelineBody">{draftText}</div>}{draftText&&<div className="formHint">内容を確認してから送信してください。Velvetから自動送信はしません。</div>}</section>}
  </main>;
}
