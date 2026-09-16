"use client";

import { useActionState } from "react";
import { MessageDraftCtaInput } from "@/components/message-draft-cta-input";
import type { MessageDraftActionState } from "@/app/people/[customerId]/message/actions";

type MessageDraftAction = (state: MessageDraftActionState, formData: FormData) => Promise<MessageDraftActionState>;

export function MessageDraftForm({ action, available, allowed, suggestion }: { action: MessageDraftAction; available: boolean; allowed: boolean; suggestion?: string }) {
  const [state, formAction, pending] = useActionState(action, {} as MessageDraftActionState);
  return <>
    <form action={formAction} className="stack compactForm">
      <label className="fieldLabel" htmlFor="channel">どこで送る？</label><select className="selectBox" id="channel" name="channel" defaultValue="line" disabled={!available||pending}><option value="line">LINE</option><option value="instagram">InstagramのDM</option><option value="email">メール</option><option value="sms">SMS</option><option value="other">その他</option></select>
      <label className="fieldLabel" htmlFor="purpose">何の連絡？</label><select className="selectBox" id="purpose" name="purpose" defaultValue="follow_up" disabled={!available||pending}><option value="follow_up">近況を聞く</option><option value="thanks">お礼</option><option value="visit_invite">来店のお誘い</option><option value="birthday">誕生日</option><option value="other">その他</option></select>
      <label className="fieldLabel" htmlFor="tone">どんな感じ？</label><select className="selectBox" id="tone" name="tone" defaultValue="natural" disabled={!available||pending}><option value="natural">いつも通り</option><option value="casual">くだけた感じ</option><option value="polite">丁寧</option><option value="warm">親しみを込める</option></select>
      <MessageDraftCtaInput suggestion={suggestion}/>
      <div className="formHint">接客メモ全文や売上・支払い情報は文案作成には使いません。</div>
      <button className="primaryButton" type="submit" disabled={!available||pending}>{pending?"文案を作っています…":allowed?"文案を作る":"Proで文案を作る"}</button>
    </form>
    {state.status&&<div className="sectionTitle">できた文案</div>}
    {state.status&&<section className="card stack" aria-live="polite"><div className="timelineTitle">{state.status==="success"?"このまま使えます":state.status==="warning"?"現在文案を作れません":"作成できませんでした"}</div>{state.draftText&&<div className="timelineBody messageDraftOutput">{state.draftText}</div>}{state.draftText&&<div className="formHint">内容を確認してから送信してください。Velvetから自動送信はしません。</div>}{state.errorCode&&state.status!=="success"&&<div className="formHint">エラー: {state.errorCode}</div>}</section>}
  </>;
}
