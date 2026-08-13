import Link from "next/link";
import { MessageDraftCtaInput } from "@/components/message-draft-cta-input";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getMessageDraftStatus } from "@/lib/message-draft";
import { requestMessageDraftAction } from "./actions";

export default async function MessageDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { customerId } = await params;
  const query = await searchParams;
  const identity = await getRequestIdentity();
  const [customer, memory] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
  ]);
  const integration = getMessageDraftStatus();
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : undefined;
  const resultStatus = value("status");
  const draftText = value("draftText");
  const errorCode = value("errorCode");

  return <main className="shell">
    <header className="header">
      <Link className="subtle" href={`/people/${customerId}`}>‹ 戻る</Link>
      <span className="subtle">MessageDraft</span>
    </header>

    <section className="hero">
      <h1>{customer.displayName || "Customer"}への文案</h1>
      <p>必要な条件だけ選んで、SNS Plannerに文案作成を依頼します。</p>
    </section>

    {!integration.configured && <div className="card noticeCard"><div className="timelineTitle">SNS Planner未接続</div><div className="timelineBody">`SNS_PLANNER_BASE_URL` を設定すると正式MessageDraft APIへ接続します。</div></div>}

    <form action={requestMessageDraftAction.bind(null, customerId)} className="stack compactForm">
      <label className="fieldLabel" htmlFor="channel">連絡方法</label>
      <select className="selectBox" id="channel" name="channel" defaultValue="line">
        <option value="line">LINE</option>
        <option value="instagram">Instagram DM</option>
        <option value="email">メール</option>
        <option value="sms">SMS</option>
        <option value="other">その他</option>
      </select>

      <label className="fieldLabel" htmlFor="purpose">目的</label>
      <select className="selectBox" id="purpose" name="purpose" defaultValue="follow_up">
        <option value="follow_up">フォロー</option>
        <option value="thanks">お礼</option>
        <option value="visit_invite">来店案内</option>
        <option value="birthday">誕生日</option>
        <option value="other">その他</option>
      </select>

      <label className="fieldLabel" htmlFor="tone">雰囲気</label>
      <select className="selectBox" id="tone" name="tone" defaultValue="natural">
        <option value="natural">自然</option>
        <option value="casual">カジュアル</option>
        <option value="polite">丁寧</option>
        <option value="warm">親しみ</option>
      </select>

      <MessageDraftCtaInput suggestion={memory?.nextTopicHint} />
      <div className="formHint">次回話題候補は「使う」を押すまで送信対象になりません。会話メモ全文・売上・支払情報は送信しません。送るのは参照IDとこの画面で選んだ条件だけです。</div>
      <button className="primaryButton" type="submit">文案を作る</button>
    </form>

    {resultStatus && <div className="sectionTitle">結果</div>}
    {resultStatus && <section className="card stack">
      <div className="timelineTitle">{resultStatus === "success" ? "文案を作成しました" : resultStatus === "warning" ? "接続待ち / 注意" : "作成できませんでした"}</div>
      {draftText && <div className="timelineBody">{draftText}</div>}
      {value("messageDraftId") && <div className="formHint">messageDraftId · {value("messageDraftId")}</div>}
      {value("messageDraftStatus") && <div className="formHint">status · {value("messageDraftStatus")}</div>}
      {value("eventName") && <div className="formHint">event · {value("eventName")}</div>}
      {value("traceId") && <div className="formHint">trace · {value("traceId")}</div>}
      {errorCode && <div className="formError">{errorCode}</div>}
    </section>}
  </main>;
}
