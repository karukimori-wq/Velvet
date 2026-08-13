import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { captureAction } from "../actions";
import type { CaptureKind } from "@/lib/capture-repository";

const groups: Array<{ title:string; fields:Array<{label:string; kind:CaptureKind; examples:string}> }> = [
  { title:"外見", fields:[{label:"髪",kind:"appearance",examples:"黒髪、白髪、金髪"},{label:"メガネ",kind:"appearance",examples:"あり、なし、赤フレーム"},{label:"顔の特徴",kind:"appearance",examples:"ヒゲ、色白、えくぼ"}] },
  { title:"服装・持ち物", fields:[{label:"服装",kind:"appearance",examples:"スーツ、カジュアル"},{label:"時計",kind:"accessory",examples:"ロレックス、オメガ"},{label:"財布",kind:"accessory",examples:"ヴィトン、エルメス"},{label:"アクセサリー",kind:"accessory",examples:"指輪、ネックレス"}] },
  { title:"人となり", fields:[{label:"仕事",kind:"work",examples:"会社経営、営業"},{label:"結婚",kind:"marital_status",examples:"既婚、未婚、不明"},{label:"趣味",kind:"hobby",examples:"ゴルフ、旅行、釣り"},{label:"好きなもの",kind:"hobby",examples:"白州、甘いもの"},{label:"人柄",kind:"knowledge",examples:"話好き、静か、気さく"},{label:"家族",kind:"knowledge",examples:"娘がいる、兄弟"}] },
  { title:"接客で覚えること", fields:[{label:"着席理由",kind:"knowledge",examples:"新規、指名、場内、ヘルプ"},{label:"注意点",kind:"knowledge",examples:"苦手な話題、避けたいこと"}] },
];

export default async function ProfileCapturePage({ searchParams }: { searchParams: Promise<{ customerId?:string }> }) {
  const { customerId } = await searchParams;
  const { workspaceId, userId } = await getRequestIdentity();
  const customers = await listGrowthCustomers(workspaceId,userId);
  if (!customerId) return <main className="shell"><header className="header"><Link className="subtle" href="/add">‹ 戻る</Link><div className="brand">お客様を覚える</div></header><section className="hero"><h1>誰について残しますか？</h1><p>お客様を選んで、分かったところだけ登録します。</p></section><div className="stack">{customers.map(c=><Link className="card personRow" href={`/capture/profile?customerId=${encodeURIComponent(c.customerId)}`} key={c.customerId}><div className="avatar">{c.displayName.slice(0,1)}</div><div className="personMain"><div className="personName">{c.displayName}</div></div><span>›</span></Link>)}{customers.length===0&&<div className="card empty">登録済みのお客様がいません</div>}</div><BottomNav /></main>;
  const customer=customers.find(c=>c.customerId===customerId);
  return <main className="shell"><header className="header"><Link className="subtle" href="/capture/profile">‹ お客様を選ぶ</Link><span className="subtle">{customer?.displayName??"お客様"}</span></header><section className="hero"><h1>分かったところだけ。</h1><p>全部埋める必要はありません。入力した項目だけ記憶に残ります。</p></section>{groups.map(group=><section key={group.title}><div className="sectionTitle">{group.title}</div><div className="profileFields">{group.fields.map(field=><form action={captureAction.bind(null,customerId,field.kind)} className="profileField" key={field.label}><label>{field.label}</label><div className="profileInputRow"><input className="searchBox" name="value" placeholder={field.examples} autoComplete="off"/><button className="secondaryButton compactButton" type="submit">追加</button></div></form>)}</div></section>)}<BottomNav /></main>;
}
