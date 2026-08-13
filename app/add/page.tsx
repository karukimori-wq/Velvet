import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { createCustomerFromVelvetAction } from "./actions";

export default async function AddPage({ searchParams }: { searchParams: Promise<{ error?: string; name?: string }> }) {
  const { error, name } = await searchParams;
  return <main className="shell">
    <header className="header"><div className="brand">追加</div></header>
    <section className="hero"><h1>何を残しますか？</h1><p>初めてのお客様と、今日の接客を分けて記録できます。</p></section>
    <div className="card"><strong>初めてのお客様</strong><p className="subtle">まず名前だけ。分かったことはあとから足せます。</p><form action={createCustomerFromVelvetAction} className="stack compactForm"><input className="searchBox" name="displayName" placeholder="名前・呼び名" defaultValue={name ?? ""} autoComplete="off" />{error === "name" && <div className="formError">名前か呼び名を入れてください。</div>}{error === "customer_create" && <div className="formError">お客様を登録できませんでした。少し時間をおいて再度お試しください。</div>}<button className="primaryButton" type="submit">登録して、この人を覚える</button></form></div>
    <div className="sectionTitle">登録済みのお客様</div>
    <div className="stack registerHub"><Link className="card registerChoice" href="/remember"><div className="registerIcon">人</div><div><strong>この人について覚える</strong><p>外見・服装・持ち物・好み・仕事など</p></div><span>›</span></Link><Link className="card registerChoice" href="/capture"><div className="registerIcon">話</div><div><strong>今日の接客を残す</strong><p>話したこと・新しく分かったこと・次回の話題</p></div><span>›</span></Link></div>
    <div className="sectionTitle">その他</div><div className="quickRegisterGrid"><Link className="card quickRegister" href="/schedule">予定を追加</Link><Link className="card quickRegister" href="/self-investment">自分の記録</Link></div><BottomNav />
  </main>;
}
