import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { AddCustomerForm } from "@/components/add-customer-form";
import { NewCustomerDetails } from "@/components/new-customer-details";
import { getGrowthEngineBridgeStatus,listGrowthCustomersWithStatus } from "@/lib/growth-engine-customer";
import { rememberPreviewGroups } from "@/lib/remember-fields";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getPlanAccess } from "@/lib/plan-access";

export default async function AddPage(){
 const bridge=getGrowthEngineBridgeStatus();const {workspaceId,userId,ownerUserId}=await getRequestIdentity();const [access,customerResult]=await Promise.all([getPlanAccess(ownerUserId),bridge.configured?listGrowthCustomersWithStatus(workspaceId,userId):Promise.resolve({customers:[],status:"unconfigured" as const})]);const customers=customerResult.customers;const sourceAvailable=customerResult.status==="ok";const atLimit=Boolean(access.customerLimit&&sourceAvailable&&customers.length>=access.customerLimit);const planLabel=access.plan==="free"?(sourceAvailable?`${customers.length}/30名`:"Free · 人数確認中"):access.plan==="pro"?"Pro":"Business";
 return <main className="shell addCustomerShell rememberHubShell"><AppHeader title="覚える" rightHref="/plans" rightLabel={access.plan==="free"?(sourceAvailable?`${customers.length}/30`:"Free"):access.plan==="pro"?"Pro":"B"}/>
 <section className="addCustomerIntro rememberHubIntro"><strong>何を覚えますか？</strong><small>お客様とのこと、予定、自分のこと。ここから選んで残せます。</small></section>
 <div className="stack registerHub rememberHubPrimary"><Link className="card registerChoice rememberPrimaryChoice" href="/capture"><div className="registerIcon">人</div><div><strong>お客様から選ぶ</strong><p>今日会う人・最近の人・名前検索から選んで覚える</p></div><span>›</span></Link>
 <NewCustomerDetails planLabel={planLabel}><div className="card addCustomerCard"><div className="row"><div><div className="timelineTitle">まず、呼び名だけ。</div><div className="formHint">登録したあと、その人について続けて覚えられます。</div></div><span className="addStepBadge">1</span></div>{bridge.configured?<AddCustomerForm atLimit={atLimit} customerCount={customers.length} sourceAvailable={sourceAvailable} freePlan={access.plan==="free"}/>:<><div className="card noticeCard"><div className="timelineTitle">新しいお客様の登録は準備中です</div><div className="formHint">登録機能の接続が終わるまで、登録項目を確認できます。</div></div><details className="detailsCard" open><summary>登録できる項目を見る</summary><div className="stack detailsBody">{rememberPreviewGroups.map(group=><div key={group.title}><div className="fieldLabel">{group.title}</div><div className="chips">{group.labels.map(item=><span className="chip" key={item}>{item}</span>)}</div></div>)}</div></details></>}</div></NewCustomerDetails></div>
 <div className="sectionTitle">ほかに覚える</div><div className="stack registerHub"><Link className="card registerChoice" href="/schedule#add-schedule"><div className="registerIcon">予</div><div><strong>予定を追加</strong><p>来店・誕生日・約束など</p></div><span>›</span></Link><Link className="card registerChoice" href="/self-investment"><div className="registerIcon">自</div><div><strong>自分のことを残す</strong><p>美容・衣装・学びなど</p></div><span>›</span></Link></div><BottomNav/></main>;
}
