"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GrowthCustomerDisplay, GrowthCustomerListResult } from "@/lib/growth-engine-customer";

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("ja").replace(/\s+/g, "");

function PersonLink({ customer }: { customer: GrowthCustomerDisplay }) {
  const name = customer.displayName ?? "お客様";
  return <Link className="card personRow capturePersonRow" href={`/capture?customerId=${encodeURIComponent(customer.customerId)}`} aria-label={`${name}さんとの出来事を覚える`}>
    <div className="avatar">{name.slice(0, 1)}</div>
    <div className="personMain"><div className="personName">{name}</div><div className="formHint">この人との出来事を覚える</div></div>
    <span aria-hidden="true">›</span>
  </Link>;
}

export function CapturePersonPicker({ customers, recentCustomerIds, sourceStatus }: { customers: GrowthCustomerDisplay[]; recentCustomerIds: string[]; sourceStatus: GrowthCustomerListResult["status"] }) {
  const [query, setQuery] = useState("");
  const recentSet = useMemo(() => new Set(recentCustomerIds), [recentCustomerIds]);
  const recent = useMemo(() => recentCustomerIds.flatMap(id => {
    const customer = customers.find(item => item.customerId === id);
    return customer ? [customer] : [];
  }), [customers, recentCustomerIds]);
  const others = useMemo(() => customers.filter(customer => !recentSet.has(customer.customerId)), [customers, recentSet]);
  const matches = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return customers.filter(customer => normalize(customer.displayName ?? "お客様").includes(needle));
  }, [customers, query]);

  if (sourceStatus !== "ok") return <div className="card empty capturePickerEmpty captureSourceError" role="status"><strong>{sourceStatus === "unconfigured" ? "お客様情報の接続を準備中です" : "お客様情報を読み込めませんでした"}</strong><span>{sourceStatus === "unconfigured" ? "Growth Engineとの接続が完了すると、ここから相手を選べます。" : "登録が消えたわけではありません。通信が戻ってから再読み込みしてください。"}</span><Link className="primaryButton actionLink" href="/capture">もう一度読み込む</Link></div>;
  if (!customers.length) return <div className="card empty capturePickerEmpty"><strong>登録済みのお客様がいません</strong><span>まず呼び名だけ登録すれば、そのまま覚え始められます。</span><Link className="primaryButton actionLink" href="/add">＋ お客様を追加</Link></div>;

  return <div className="capturePickerBody">
    <label className="capturePersonSearch"><input className="searchBox" value={query} onChange={event => setQuery(event.target.value)} placeholder="名前・呼び名で探す" aria-label="お客様を名前・呼び名で検索" autoComplete="off" inputMode="search"/><span aria-hidden="true">⌕</span></label>
    {query ? <section className="capturePickerSection"><div className="capturePickerLabel">検索結果 <span>{matches.length}人</span></div><div className="capturePersonList">{matches.map(customer => <PersonLink customer={customer} key={customer.customerId}/>)}{!matches.length && <div className="capturePickerNoMatch" role="status">見つかりませんでした。呼び名を変えて探してみてください。</div>}</div></section> : <>
      {recent.length > 0 && <section className="capturePickerSection"><div className="capturePickerLabel">最近覚えた人</div><div className="capturePersonList captureRecentPeople">{recent.map(customer => <PersonLink customer={customer} key={customer.customerId}/>)}</div></section>}
      <section className="capturePickerSection"><div className="capturePickerLabel">{recent.length ? "すべてのお客様" : "お客様"} <span>{customers.length}人</span></div><div className="capturePersonList">{(recent.length ? others : customers).map(customer => <PersonLink customer={customer} key={customer.customerId}/>)}</div></section>
    </>}
    <Link className="captureAddPerson actionLink" href="/add">＋ 新しいお客様を追加</Link>
  </div>;
}
