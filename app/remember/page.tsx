import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import type { CaptureKind } from "@/lib/capture-repository";
import { saveRememberField } from "./remember-actions";

const groups: Array<{ title:string; fields:Array<{label:string; kind:CaptureKind; examples:string[]}> }> = [
  { title:"外見", fields:[
    {label:"髪",kind:"appearance",examples:["黒髪","白髪","金髪","短髪"]},
    {label:"メガネ",kind:"appearance",examples:["あり","なし","黒フレーム"]},
    {label:"顔の特徴",kind:"appearance",examples:["ヒゲ","色白","えくぼ"]},
  ]},
  { title:"服装・アクセサリー", fields:[
    {label:"服装",kind:"appearance",examples:["スーツ","カジュアル","きれいめ"]},
    {label:"時計",kind:"accessory",examples:["ロレックス","オメガ","なし"]},
    {label:"財布",kind:"accessory",examples:["ヴィトン","エルメス"]},
    {label:"アクセサリー",kind:"accessory",examples:["指輪","ネックレス","なし"]},
  ]},
  { title:"人となり", fields:[
    {label:"仕事",kind:"work",examples:["会社経営","会社員","自営業"]},
    {label:"結婚",kind:"marital_status",examples:["既婚","未婚","不明"]},
    {label:"趣味",kind:"hobby",examples:["ゴルフ","旅行","釣り"]},
    {label:"好きなもの",kind:"hobby",examples:["白州","甘いもの"]},
    {label:"人柄",kind:"knowledge",examples:["話好き","静か","気さく"]},
    {label:"家族",kind:"knowledge",examples:["娘がいる","息子がいる"]},
  ]},
  { title:"接客で覚えること", fields:[
    {label:"着席理由",kind:"knowledge",examples:["新規","指名","場内指名","ヘルプ"]},
    {label:"注意点",kind:"knowledge",examples:["お酒弱め","苦手な話題あり"]},
  ]},
];

export default async function RememberPage({ searchParams }: { searchParams: Promise<{ customerId?:string; savedLabel?:string; savedValue?:string; error?:string }> }) {
  const { customerId, savedLabel, savedValue, error } = await searchParams;
  const { workspaceId, userId } = await getRequestIdentity();
  const customers = await listGrowthCustomers(workspaceId,userId);

  if (!customerId) return <main className="shell"><header className="header"><Link className="subtle" href="/add">‹ 戻る</Link><div className="brand">お客様を覚える</div></header><section className="hero"><h1>誰について残しますか？</h1><p>お客様を選んで、分かったところだけ登録します。</p></section><div className="stack">{customers.map(c=><Link className="card personRow" href={`/remember?customerId=${encodeURIComponent(c.customerId)}`} key={c.customerId}><div className="avatar">{c.displayName?.slice(0,1) ?? "人"}</div><div className="personMain"><div className="personName">{c.displayName ?? "お客様"}</div></div><span>›</span></Link>)}{customers.length===0&&<div className="card empty">登録済みのお客様がいません</div>}</div><BottomNav /></main>;

  const customer=customers.find(c=>c.customerId===customerId);
  const memory=await getCustomerMemory(workspaceId,userId,customerId);
  const currentValue=(label:string)=>memory?.tags.find(tag=>tag.startsWith(`${label}：`))?.slice(label.length+1);

  return <main className="shell">
    <header className="header"><Link className="subtle" href="/add">‹ 追加</Link><span className="subtle">{customer?.displayName??"お客様"}</span></header>
    <section className="hero"><h1>この人を覚える</h1><p>分かったところだけで大丈夫です。候補を押すか、自由に入力できます。</p></section>
    {savedLabel&&savedValue&&<div className="card successCard"><div className="formHint">登録した内容</div><strong>{savedLabel}：{savedValue}</strong></div>}
    {error&&<div className="formError">入力内容を確認してください。</div>}
    {groups.map(group=><section key={group.title}><div className="sectionTitle">{group.title}</div><div className="profileFields">{group.fields.map(field=>{const current=currentValue(field.label);return <div className="profileField card" key={field.label}><div className="row"><strong>{field.label}</strong>{current&&<span className="subtle">登録済み：{current}</span>}</div><div className="chips">{field.examples.map(example=><form action={saveRememberField.bind(null,customerId,field.label,field.kind,example)} key={example}><button className={`chip chipButton${current===example?" selectedChip":""}`} type="submit">{example}</button></form>)}</div><form action={saveRememberField.bind(null,customerId,field.label,field.kind,undefined)} className="profileInputRow"><input className="searchBox" name="value" placeholder={current?"変更する場合は入力":"自由に入力"} autoComplete="off"/><button className="secondaryButton compactButton" type="submit">{current?"変更":"追加"}</button></form></div>})}</div></section>)}
    <div className="sectionTitle">ここまででOK</div><div className="searchActions"><Link className="secondaryButton actionLink" href={`/people/${customerId}`}>この人を見る</Link><Link className="primaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(customerId)}`}>今日話したことも残す</Link></div>
    <BottomNav />
  </main>;
}
