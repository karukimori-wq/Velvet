import Link from "next/link";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getGrowthCustomer } from "@/lib/growth-engine-customer";
import { createGiftAction } from "./actions";

export default async function GiftPage({ params, searchParams }: { params: Promise<{ personId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { personId: customerId } = await params;
  const { error } = await searchParams;
  const { workspaceId, userId } = await getRequestIdentity();
  const customer = await getGrowthCustomer(workspaceId, userId, customerId);
  const displayName = customer?.displayName ?? `Customer ${customerId}`;
  const commonItems = ["お土産", "花", "財布", "時計", "ボトル", "アクセサリー"];

  return <main className="shell">
    <header className="header"><Link className="subtle" href={`/people/${customerId}`}>‹ 戻る</Link><span className="subtle">Gift</span></header>
    <section className="hero"><h1>{displayName}</h1><p>もらった・あげたを最短で記録します。</p></section>
    {error && <div className="formError">品物を入力してください。</div>}
    <div className="sectionTitle">もらった</div>
    <form action={createGiftAction.bind(null, customerId, "received")} className="stack"><div className="chips">{commonItems.map((item) => <button className="chip chipButton" type="submit" name="item" value={item} key={`r-${item}`}>{item}</button>)}</div><input className="searchBox" name="item" placeholder="その他：品物を入力" autoComplete="off" /><button className="primaryButton" type="submit">もらった物を保存</button></form>
    <div className="sectionTitle">あげた</div>
    <form action={createGiftAction.bind(null, customerId, "given")} className="stack"><div className="chips">{commonItems.map((item) => <button className="chip chipButton" type="submit" name="item" value={item} key={`g-${item}`}>{item}</button>)}</div><input className="searchBox" name="item" placeholder="その他：品物を入力" autoComplete="off" /><button className="secondaryButton" type="submit">あげた物を保存</button></form>
  </main>;
}
