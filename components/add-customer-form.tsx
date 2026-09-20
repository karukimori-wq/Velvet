"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createCustomerFromVelvetAction, type AddCustomerActionState } from "@/app/add/actions";

const initialState: AddCustomerActionState = {};

export function AddCustomerForm({ atLimit, customerCount }: { atLimit: boolean; customerCount: number }) {
  const [state, action, pending] = useActionState(createCustomerFromVelvetAction, initialState);
  const [displayName, setDisplayName] = useState("");

  return <form action={action} className="stack compactForm">
    <label className="fieldLabel" htmlFor="displayName">名前・呼び名</label>
    <input id="displayName" className="searchBox" name="displayName" placeholder="例：あやさん" value={displayName} onChange={event => setDisplayName(event.target.value)} autoComplete="off" disabled={atLimit || pending} />
    {state.error === "name" && <div className="formError" role="alert">名前か呼び名を入れてください。入力した内容はこの画面に残ります。</div>}
    {state.error === "customer_create" && <div className="formError" role="alert">今はお客様を登録できません。入力した呼び名は残しているので、そのまま再度お試しください。</div>}
    {state.error === "source_unavailable" && <div className="card noticeCard" role="alert"><strong>お客様情報を確認できません</strong><div className="formHint">Freeの30名上限を安全に確認できないため、今は新規登録を止めています。入力内容はこの画面に残っています。</div></div>}
    {(state.error === "customer_limit" || atLimit) && <div className="card noticeCard"><strong>Freeは30名までです</strong><div className="formHint">登録済み {state.count ?? customerCount}/30名。Proでは人数の上限なく管理できます。</div><Link className="secondaryButton actionLink" href="/plans">プランを見る</Link></div>}
    <button className="primaryButton" type="submit" disabled={atLimit || pending}>{pending ? "登録しています…" : "登録して、この人を覚える →"}</button>
    <div className="formHint addPrivacyHint">詳しい情報は後から。最初から全部入力する必要はありません。</div>
  </form>;
}
