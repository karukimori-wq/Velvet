import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import type { CaptureKind } from "@/lib/capture-repository";
import { saveRememberField } from "./remember-actions";

type Field = { label:string; kind:CaptureKind; examples:string[] };
const groups: Array<{ title:string; hint?:string; fields:Field[] }> = [
  { title:"外見", hint:"初対面で見分けるための特徴", fields:[{label:"髪",kind:"appearance",examples:["黒髪","白髪","金髪","短髪"]},{label:"メガネ",kind:"appearance",examples:["あり","なし","黒フレーム"]},{label:"顔の特徴",kind:"appearance",examples:["ヒゲ","色白","えくぼ"]}]},
  { title:"服装・アクセサリー", fields:[{label:"服装",kind:"appearance",examples:["スーツ","カジュアル","きれいめ"]},{label:"時計",kind:"accessory",examples:["ロレックス","オメガ","なし"]},{label:"財布",kind:"accessory",examples:["ヴィトン","エルメス"]},{label:"アクセサリー",kind:"accessory",examples:["指輪","ネックレス","なし"]}]},
  { title:"人となり", fields:[{label:"仕事",kind:"work",examples:["会社経営","会社員","自営業"]},{label:"結婚",kind:"marital_status",examples:["既婚","未婚","不明"]},{label:"出身",kind:"knowledge",examples:[]},{label:"趣味",kind:"hobby",examples:["ゴルフ","旅行","釣り"]},{label:"人柄",kind:"knowledge",examples:["話好き","静か","気さく"]},{label:"家族",kind:"knowledge",examples:["娘がいる","息子がいる"]}]},
  { title:"好み", hint:"次の接客で使いやすい情報", fields:[{label:"よく飲むもの",kind:"drink",examples:["ビール","ハイボール","白州","焼酎"]},{label:"好きなもの",kind:"hobby",examples:["甘いもの","肉","旅行"]},{label:"苦手なもの",kind:"knowledge",examples:["甘いもの","お酒","辛いもの"]}]},
  { title:"接客で覚えること", fields:[{label:"着席理由",kind:"knowledge",examples:["新規","指名","場内指名","ヘルプ"]},{label:"注意点",kind:"knowledge",examples:["お酒弱め","苦手な話題あり"]}]},
];

export default async function RememberPage({ searchParams }: { searchParams: Promise<{ customerId?:string; savedLabel?:string; savedValue?:string; error?:string; new?:string }> }) {
  const { customerId, savedLabel, savedValue, error, new: newCustomer } = await searchParams;
  const isNewCustomer = newCustomer === "1";
  const { workspaceId, userId } = await getRequestIdentity();
  const customers = await listGrowthCustomers(workspaceId,userId);
  if (!customerId) return <main className="shell"><header className="header"><Link className="subtle" href="/add">‹ 戻る</Link><div className="brand">お客様を覚える</div></header><section className="hero"><h1>誰について残しますか？</h1><p>お客様を選んで、分かったところだけ登録します。</p></section><div className="stack">{customers.map(c=><Link className="card personRow" href={`/remember?customerId=${encodeURIComponent(c.customerId)}`} key={c.customerId}><div className="avatar">{c.displayName?.slice(0,1) ?? "人"}</div><div className="personMain"><div className="personName">{c.displayName ?? "お客様"}</div></div><span>›</span></Link>)}{customers.length===0&&<div className="card empty">登録済みのお客様がいません</div>}</div><BottomNav /></main>;

  const customer=customers.find(c=>c.customerId===customerId);
  const memory=await getCustomerMemory(workspaceId,userId,customerId);
  const currentValue=(label:string)=>memory?.tags.find(tag=>tag.startsWith(`${label}：`))?.slice(label.length+1);
  const countFilled=(fields:Field[])=>fields.filter(field=>currentValue(field.label)).length;

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/add">‹ 追加</Link><span className="subtle">{customer?.displayName??"お客様"}</span></header>
    <section className="hero"><h1>{isNewCustomer ? "まず、この人を覚える" : "この人を覚える"}</h1><p>{isNewCustomer ? "見たこと、聞いたことだけでOK。外見や持ち物からすぐ残せます。" : "全部埋めなくて大丈夫です。覚えたいところだけ開いてください。"}</p></section>
    {savedLabel&&savedValue&&<div className="card successCard"><div className="formHint">登録した内容</div><strong>{savedLabel}：{savedValue}</strong></div>}
    {error&&<div className="formError">入力内容を確認してください。</div>}
    <div className="stack rememberGroups">{groups.map((group,index)=>{const filled=countFilled(group.fields);const recentlySaved=Boolean(savedLabel&&group.fields.some(field=>field.label===savedLabel));const startOpen=isNewCustomer ? index<2 : index===0;return <details className="card rememberGroup" key={group.title} open={recentlySaved || startOpen}><summary><div><strong>{group.title}</strong>{group.hint&&<div className="formHint">{group.hint}</div>}</div><span className="subtle">{filled>0?`${filled}件登録済み`:`開く`}</span></summary><div className="profileFields rememberGroupBody">{group.fields.map(field=>{const current=currentValue(field.label);return <div className="profileField" key={field.label}><div className="row"><strong>{field.label}</strong>{current&&<span className="subtle">登録済み：{current}</span>}</div>{field.examples.length>0&&<div className="chips">{field.examples.map(example=><form action={saveRememberField.bind(null,customerId,field.label,field.kind,example,isNewCustomer)} key={example}><button className={`chip chipButton${current===example?" selectedChip":""}`} type="submit">{example}</button></form>)}</div>}<form action={saveRememberField.bind(null,customerId,field.label,field.kind,undefined,isNewCustomer)} className="profileInputRow"><input className="searchBox" name="value" placeholder={current?"変更する場合は入力":"自由に入力"} autoComplete="off"/><button className="secondaryButton compactButton" type="submit">{current?"変更":"追加"}</button></form></div>})}</div></details>})}</div>
    <div className="sectionTitle">ここまででOK</div><div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${customerId}`}>この人を見る</Link><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(customerId)}`}>今日の接客を残す</Link></div>
    <BottomNav />
  </main>;
}
