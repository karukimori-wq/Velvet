import { BottomNav } from "@/components/bottom-nav";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { listGrowthCustomers } from "@/lib/growth-engine-customer";
import { createScheduleAction } from "./actions";

const kindLabel = { shift: "出勤", visit: "来店", birthday: "誕生日", unavailable: "NG時間", self_investment: "自己投資", other: "その他" } as const;

export default async function SchedulePage() {
  const { workspaceId, userId } = await getRequestIdentity();
  const [entries, customers] = await Promise.all([
    listScheduleEntries(workspaceId, userId),
    listGrowthCustomers(workspaceId, userId),
  ]);
  const customerById = new Map(customers.map((customer) => [customer.customerId, customer]));

  return <main className="shell scheduleShell">
    <header className="header"><div className="brand">予定</div></header>
    <section className="hero"><h1>予定だけ、シンプルに。</h1><p>来店や出勤、誕生日などを必要な分だけ残せます。</p></section>
    {entries.length > 0 ? <div className="stack">{entries.map((entry) => <article className="card" key={entry.id}><div className="row"><strong>{entry.title}</strong><span className="subtle">{kindLabel[entry.kind]}</span></div><div className="personMeta">{new Date(entry.startsAt).toLocaleString("ja-JP")}</div>{entry.customerId && <div className="timelineBody">お客様 · {customerById.get(entry.customerId)?.displayName ?? "登録済みのお客様"}</div>}{entry.note && <div className="timelineBody">{entry.note}</div>}</article>)}</div> : <div className="card empty">予定はまだありません</div>}
    <div className="sectionTitle">予定を追加</div>
    <form action={createScheduleAction} className="stack scheduleForm">
      <input className="searchBox" name="title" placeholder="例：来店 / 出勤 / ネイル" autoComplete="off" />
      <div className="chips choiceRow">{(["visit", "shift", "birthday", "unavailable", "self_investment", "other"] as const).map((kind) => <label className="choiceChip" key={kind}><input type="radio" name="kind" value={kind} defaultChecked={kind === "visit"} />{kindLabel[kind]}</label>)}</div>
      {customers.length > 0 && <select className="selectBox" name="customerId" defaultValue=""><option value="">お客様を選ぶ（必要な時だけ）</option>{customers.map((customer) => <option key={customer.customerId} value={customer.customerId}>{customer.displayName}</option>)}</select>}
      <label className="fieldLabel" htmlFor="startsAt">日時</label>
      <input id="startsAt" className="searchBox" name="startsAt" type="datetime-local" />
      <input className="searchBox" name="note" placeholder="メモ（必要な時だけ）" autoComplete="off" />
      <button className="primaryButton" type="submit">追加する</button>
    </form>
    <BottomNav />
  </main>;
}
