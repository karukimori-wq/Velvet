import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { AddCustomerForm } from "@/components/add-customer-form";
import { getGrowthEngineBridgeStatus,listGrowthCustomers } from "@/lib/growth-engine-customer";
import { rememberPreviewGroups } from "@/lib/remember-fields";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";

export default async function AddPage(){
 const bridge=getGrowthEngineBridgeStatus();const {workspaceId,userId,ownerUserId}=await getRequestIdentity();const [access,customers]=await Promise.all([getPlanAccess(ownerUserId),bridge.configured?listGrowthCustomers(workspaceId,userId):Promise.resolve([])]);const atLimit=Boolean(access.customerLimit&&customers.length>=access.customerLimit);const planLabel=access.plan==="free"?`${customers.length}/30名`:access.plan==="pro"?"Pro":"Business";
 return <main className="shell addCustomerShell"><AppHeader title="お客様を追加" rightHref="/plans" rightLabel={access.plan==="free"?`${customers.length}/30`:access.plan==="pro"?"Pro":"B"}/>
 <section className="addCustomerIntro"><strong>まず、呼び名だけ。</strong><small>登録したあと、その人について覚えておきたいことを続けて追加できます。</small></section>
 <div className="card addCustomerCard"><div className="row"><div><div className="timelineTitle">新しいお客様</div><div className="formHint">{planLabel}</div></div><span className="addStepBadge">1</span></div>{bridge.configured?<AddCustomerForm atLimit={atLimit} customerCount={customers.length}/>:<><div className="card noticeCard"><div className="timelineTitle">新しいお客様の登録は準備中です</div><div className="formHint">登録機能の接続が終わるまで、登録項目を確認できます。</div></div><details className="detailsCard" open><summary>登録できる項目を見る</summary><div className="stack detailsBody">{rememberPreviewGroups.map(group=><div key={group.title}><div className="fieldLabel">{group.title}</div><div className="chips">{group.labels.map(item=><span className="chip" key={item}>{item}</span>)}</div></div>)}</div></details></>}</div>
 <div className="sectionTitle">すでに登録している人なら</div><div className="stack registerHub"><Link className="card registerChoice" href="/capture"><div className="registerIcon">＋</div><div><strong>今日のことを覚える</strong><p>会話・来店・贈り物などを、短く残す</p></div><span>›</span></Link><Link className="card registerChoice" href="/people"><div className="registerIcon">人</div><div><strong>お客様から選ぶ</strong><p>一覧から相手を選んで、思い出す・覚える</p></div><span>›</span></Link></div>
 <div className="sectionTitle">予定・自分のこと</div><div className="stack registerHub"><Link className="card registerChoice" href="/schedule#add-schedule"><div className="registerIcon">予</div><div><strong>予定を追加</strong><p>来店・誕生日・約束など</p></div><span>›</span></Link><Link className="card registerChoice" href="/self-investment"><div className="registerIcon">自</div><div><strong>自分のことを残す</strong><p>美容・衣装・学びなど</p></div><span>›</span></Link></div><BottomNav/></main>;
}
