import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { getPlanAccess,isWithinHistoryWindow } from "@/lib/plan-access";

const labels:Record<string,string>={visit:"来店",conversation:"会話",note:"メモ",gift:"プレゼント",schedule:"予定",relationship:"関係",next_action:"次回"};
export default async function HistoryItemPage({params}:{params:Promise<{customerId:string;timelineId:string}>}){
 const {customerId,timelineId}=await params;const {workspaceId,userId,ownerUserId}=await getRequestIdentity();const [item,access]=await Promise.all([getProfessionalTimelineItem(workspaceId,userId,customerId,timelineId),getPlanAccess(ownerUserId)]);if(!item)notFound();const available=isWithinHistoryWindow(item.occurredAt,access);return <main className="shell"><header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ 戻る</Link><span className="subtle">{access.plan==="free"?"Free":"Pro"}</span></header><section className="hero"><h1>{item.title}</h1><p>{item.occurredAt.slice(0,10)} · {labels[item.eventType]??item.eventType}</p></section>{available?<section className="card"><div className="timelineBody">{item.body||"内容の記録はありません。"}</div></section>:<section className="card noticeCard"><strong>Freeで確認できるのは直近3か月です</strong><div className="formHint">この記録は削除されていません。Proへ変更すると過去の履歴も再び確認できます。</div><Link className="secondaryButton actionLink" href="/plans">プランを見る</Link></section>}<BottomNav/></main>
}
