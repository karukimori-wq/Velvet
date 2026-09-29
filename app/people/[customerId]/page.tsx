import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { CustomerMediaPanel } from "@/components/customer-media-panel";
import { getRequestIdentity } from "@/lib/auth/request-identity";
import { getCustomerMemory } from "@/lib/customer-memory-repository";
import { getGrowthCustomerDisplay } from "@/lib/growth-engine-customer";
import { getActiveProfessionalVisit } from "@/lib/professional-visit-repository";
import { listProfessionalTimeline, type ProfessionalTimelineItem } from "@/lib/professional-timeline-repository";
import { listNextActions } from "@/lib/professional-next-action-repository";
import { listScheduleEntries } from "@/lib/schedule-repository";
import { buildCustomerRecall } from "@/lib/customer-recall";
import { rememberGroups } from "@/lib/remember-fields";
import { getPlanAccess, isWithinHistoryWindow, hasVelvetFeature } from "@/lib/plan-access";
import { getOwnerPreferences } from "@/lib/owner-preferences";
import { buildSoonVisitAlert } from "@/lib/soon-alerts";
import { startVisitAction } from "@/app/visits/actions";

const eventLabels: Record<string, string> = { visit: "来店", conversation: "会話", note: "メモ", gift: "ギフト", schedule: "予定", relationship: "関係", next_action: "フォロー", media: "画像" };
const DAY = 24 * 60 * 60 * 1000;
const highlightPriority = ["注意点", "メガネ", "趣味", "よく飲むもの", "仕事", "家族", "会話の好み", "服装", "時計"];
const customerTabs = ["basic", "profile", "history", "about"] as const;
type CustomerTab = typeof customerTabs[number];
const visitReasonOptions = ["新規", "指名", "場内指名", "ヘルプ", "フリー", "VIP"];

function tagLabel(value: string) { const index = value.indexOf("："); return index >= 0 ? value.slice(0, index) : ""; }
function tagValue(value: string) { const index = value.indexOf("："); return compactText(index >= 0 ? value.slice(index + 1) : value, 42); }
function compactText(value: string, max = 48) {
  const text = value.replace(/\s+/g, " ").replace(/。+/g, "。").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
function compactRecallValue(value: string, max = 56) {
  const text = value.replace(/\s+/g, " ").replace(/。+/g, "。").trim();
  if (!text) return "";
  const chunks = text.split(/。|\s+(?=[^：\s]{1,14}：)/).map(chunk => chunk.trim()).filter(Boolean);
  const grouped = new Map<string, string[]>();
  for (const chunk of chunks) {
    const index = chunk.indexOf("：");
    if (index <= 0) continue;
    const label = chunk.slice(0, index).trim();
    const rawValue = chunk.slice(index + 1).trim();
    if (!label || !rawValue || label.length > 14) continue;
    const arrowParts = rawValue.split("→");
    const normalizedValue = arrowParts[arrowParts.length - 1].trim();
    if (!normalizedValue) continue;
    if (rawValue.includes("→")) grouped.set(label, [normalizedValue]);
    else {
      const values = grouped.get(label) ?? [];
      if (!values.includes(normalizedValue)) values.push(normalizedValue);
      grouped.set(label, values);
    }
  }
  if (grouped.size >= 2) {
    const summary = Array.from(grouped.entries()).slice(0, 3).map(([label, values]) => `${label}：${values.slice(0, 2).join("・")}`).join(" / ");
    return compactText(summary, max);
  }
  return compactText(text, max);
}
function formatShortDate(value?: string) {
  if (!value) return "なし";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "なし";
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", timeZone: "Asia/Tokyo" }).format(date);
}
function formatTimelineDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", timeZone: "Asia/Tokyo" }).format(date);
}
function daysUntil(dateLike?: string) { if (!dateLike) return undefined; const due = new Date(dateLike); if (!Number.isFinite(due.getTime())) return undefined; const today = new Date(); today.setHours(0, 0, 0, 0); const target = new Date(due); target.setHours(0, 0, 0, 0); return Math.round((target.getTime() - today.getTime()) / DAY); }
function dueLabel(dateLike?: string) { const days = daysUntil(dateLike); if (days === undefined) return undefined; if (days < 0) return `${Math.abs(days)}日過ぎ`; if (days === 0) return "今日まで"; return `あと${days}日`; }
function normalizeVisitReason(value?: string) {
  const text = value?.trim();
  if (!text) return "未登録";
  return visitReasonOptions.find(option => text.includes(option)) ?? compactText(text, 10);
}
function tabHref(customerId: string, tab: CustomerTab) { return `/people/${encodeURIComponent(customerId)}?tab=${tab}`; }

function ProTimelineRows({ items }: { items: ProfessionalTimelineItem[] }) {
  return <div className="customerCompactTimeline">{items.map(item => <details className="customerTimelineRow" key={item.id}><summary><time>{formatTimelineDate(item.occurredAt)}</time><span className="customerTimelineKind">{eventLabels[item.eventType] ?? "記録"}</span><strong>{compactText(item.title, 34)}</strong><span className="customerTimelineChevron">›</span></summary>{item.body && <div className="customerTimelineBody">{compactText(item.body, 120)}</div>}</details>)}</div>;
}
function FreeHistoryRows({ items, customerId }: { items: ProfessionalTimelineItem[]; customerId: string }) {
  return <div className="customerCompactTimeline">{items.map(item => <Link className="customerTimelineRow customerTimelineLink" href={`/people/${customerId}/history/${item.id}`} key={item.id}><time>{formatTimelineDate(item.occurredAt)}</time><span className="customerTimelineKind">{eventLabels[item.eventType] ?? "記録"}</span><strong>{compactText(item.title, 34)}</strong><span className="customerTimelineChevron">›</span></Link>)}</div>;
}

export default async function Page({ params, searchParams }: { params: Promise<{ customerId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { customerId } = await params;
  const query = await searchParams;
  const activeTab: CustomerTab = customerTabs.includes(query.tab as CustomerTab) ? query.tab as CustomerTab : "basic";
  const identity = await getRequestIdentity();
  const [customer, memory, timeline, activeVisit, nextActions, schedules, access, preferences] = await Promise.all([
    getGrowthCustomerDisplay({ workspaceId: identity.workspaceId, userId: identity.userId, customerId }),
    getCustomerMemory(identity.workspaceId, identity.userId, customerId),
    listProfessionalTimeline(identity.workspaceId, identity.userId, customerId),
    getActiveProfessionalVisit(identity.workspaceId, identity.userId, customerId),
    listNextActions(identity.workspaceId, identity.userId, customerId),
    listScheduleEntries(identity.workspaceId, identity.userId),
    getPlanAccess(identity.ownerUserId),
    getOwnerPreferences(identity.ownerUserId),
  ]);

  const displayName = customer.displayName || memory?.displayNameSnapshot || "お客様";
  const quickRecall = buildCustomerRecall(memory, { maxItems: 5, maxNextTopics: 2 });
  const tags = memory?.tags ?? [];
  const isVip = tags.some(tag => tag.toUpperCase().includes("VIP"));
  const profileGroups = rememberGroups.map(group => {
    const rows = group.fields.map(field => {
      const values = Array.from(new Set(tags.filter(tag => tagLabel(tag) === field.label).map(tagValue).filter(Boolean)));
      return values.length ? { label: field.label, value: values.slice(-2).join("・") } : undefined;
    }).filter((row): row is { label: string; value: string } => Boolean(row));
    return { title: group.title, rows };
  }).filter(group => group.rows.length > 0);
  const memoryFactCount = profileGroups.reduce((sum, group) => sum + group.rows.length, 0);

  const sortedTimeline = [...timeline].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const lastVisit = sortedTimeline.find(item => item.eventType === "visit");
  const lastConversation = sortedTimeline.find(item => item.eventType === "conversation" || item.eventType === "note");
  const nextSchedule = schedules.filter(item => item.customerId === customerId && new Date(item.startsAt).getTime() >= Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  const visibleTimeline = access.fullHistory ? sortedTimeline : sortedTimeline.filter(item => isWithinHistoryWindow(item.occurredAt, access));
  const recentTimeline = visibleTimeline.slice(0, 8);
  const olderTimeline = visibleTimeline.slice(8);
  const archivedCount = sortedTimeline.length - visibleTimeline.length;
  const followupAllowed = hasVelvetFeature(access, "followup.manage");
  const openNext = followupAllowed ? nextActions.filter(action => action.status === "open").slice(0, 3) : [];
  const urgentNext = openNext.filter(action => action.dueAt && (daysUntil(action.dueAt) ?? 99) <= 7).slice(0, 1);
  const soonAlert = access.soonAlertsAllowed && preferences.soonAlertsEnabled ? buildSoonVisitAlert(customerId, sortedTimeline) : undefined;

  const factMap = new Map<string, string>();
  for (const group of profileGroups) for (const row of group.rows) if (!factMap.has(row.label)) factMap.set(row.label, row.value);
  const basicProfileGroup = profileGroups.find(group => group.title === "基本情報");
  const detailProfileGroups = profileGroups.filter(group => group.title !== "基本情報");
  const birthday = factMap.get("誕生日") || "未登録";
  const visitReason = normalizeVisitReason(factMap.get("来店理由") ?? factMap.get("来店区分") ?? (isVip ? "VIP" : undefined));

  const highlights: Array<{ label: string; value: string }> = [];
  const caution = quickRecall.items.find(item => item.label === "注意" || item.label === "注意点");
  if (caution?.value) highlights.push({ label: "注意", value: compactRecallValue(caution.value, 50) });
  if (urgentNext[0]) highlights.push({ label: "期限付きフォロー", value: `${compactText(urgentNext[0].text, 30)}${dueLabel(urgentNext[0].dueAt) ? ` · ${dueLabel(urgentNext[0].dueAt)}` : ""}` });
  if (lastConversation && highlights.length < 4) highlights.push({ label: "前回の話題", value: compactRecallValue(lastConversation.body || lastConversation.title, 56) });
  for (const label of highlightPriority) {
    if (highlights.length >= 4) break;
    const value = factMap.get(label);
    if (value && !highlights.some(item => item.label === label)) highlights.push({ label, value });
  }
  if (highlights.length < 4) {
    for (const item of quickRecall.items) {
      if (highlights.length >= 4) break;
      if (item.label === "前回" || !item.value || highlights.some(existing => existing.label === item.label)) continue;
      highlights.push({ label: item.label, value: compactRecallValue(item.value, 50) });
    }
  }
  if (highlights.length < 4 && quickRecall.nextTopics.length > 0) highlights.push({ label: "次に話す", value: compactText(quickRecall.nextTopics.join("・"), 42) });
  if (highlights.length < 4 && soonAlert) highlights.push({ label: "そろそろ", value: `前回来店から${soonAlert.daysSinceLastVisit}日 · いつも約${soonAlert.averageIntervalDays}日周期` });

  const mediaItems = access.imagesAllowed ? sortedTimeline.filter(item => item.eventType === "media" && item.sourceRef?.startsWith("r2:")).map(item => ({ id: item.id, key: item.sourceRef!.slice(3), occurredAt: item.occurredAt, title: item.title })) : [];
  const savedItems = [Number(query.memoryAdded) > 0 && `人物情報 ${query.memoryAdded}件`, Number(query.knowledgeAdded) > 0 && `新しく分かったこと ${query.knowledgeAdded}件`, Number(query.preferenceAdded) > 0 && `好み ${query.preferenceAdded}件`, Number(query.nextTopicAdded) > 0 && `次回話題 ${query.nextTopicAdded}件`, Number(query.scheduleAdded) > 0 && `予定 ${query.scheduleAdded}件`, Number(query.giftAdded) > 0 && `贈り物 ${query.giftAdded}件`].filter(Boolean) as string[];

  return <main className="shell customerDetailShell customerDetailDense">
    <header className="velvetHeader"><Link className="menuButton actionLink" href="/people" aria-label="顧客一覧へ戻る">‹</Link><div className="pageTitle">顧客詳細</div><Link className="headerAction" href={`/remember?customerId=${customerId}`} aria-label="顧客情報を編集">…</Link></header>

    <section className="detailIdentity detailIdentityCompact"><div className="avatar">{displayName.slice(0, 1)}</div><div className="detailIdentityText"><h1>{displayName}{isVip && <span className="vipBadge">♛ VIP</span>}</h1><div className="customerMetaLine"><span>最終来店 {formatShortDate(lastVisit?.occurredAt)}</span><span>人物情報 {memoryFactCount}件</span></div></div></section>

    <div className="customerStatusStrip" aria-label="顧客の状況">
      <div className={`customerStatusCard${visitReason !== "未登録" ? " customerStatusCardActive" : ""}`}><span className="customerStatusIcon">来</span><strong>来店理由</strong><small>{visitReason}</small></div>
      <div className="customerStatusCard"><span className="customerStatusIcon">◇</span><strong>誕生日</strong><small>{birthday}</small></div>
      <Link className="customerStatusCard" href="/schedule"><span className="customerStatusIcon">▣</span><strong>予定確認</strong><small>{nextSchedule ? formatShortDate(nextSchedule.startsAt) : "予定なし"}</small></Link>
      <Link className="customerStatusCard" href={`/remember?customerId=${customerId}`}><span className="customerStatusIcon">✎</span><strong>編集</strong><small>人物情報</small></Link>
    </div>

    <div className="visitPrimaryAction">{activeVisit ? <Link className="primaryButton actionLink" href={`/visits/${activeVisit.id}`}>接客中に戻る</Link> : <form action={startVisitAction}><input type="hidden" name="customerId" value={customerId}/><button className="primaryButton" type="submit">来店を残す</button></form>}</div>

    <nav className="customerContextActions" aria-label="顧客詳細のセクション">
      <Link className={`customerSectionTab${activeTab === "basic" ? " customerSectionTabActive" : ""}`} href={tabHref(customerId, "basic")} scroll={false}><strong>基本情報</strong></Link>
      <Link className={`customerSectionTab${activeTab === "profile" ? " customerSectionTabActive" : ""}`} href={tabHref(customerId, "profile")} scroll={false}><strong>人物情報</strong></Link>
      <Link className={`customerSectionTab${activeTab === "history" ? " customerSectionTabActive" : ""}`} href={tabHref(customerId, "history")} scroll={false}><strong>履歴</strong></Link>
      <Link className={`customerSectionTab${activeTab === "about" ? " customerSectionTabActive" : ""}`} href={tabHref(customerId, "about")} scroll={false}><strong>要点</strong></Link>
    </nav>

    {query.captureSaved && <div className="card successCard stack captureSavedCard"><strong>今日の大切なことを覚えました</strong>{savedItems.length > 0 ? <div className="captureSavedItems">{savedItems.map(item => <div className="timelineBody" key={item}>✓ {item}</div>)}</div> : <div className="formHint">入力した会話を履歴に残しました。</div>}<div className="captureSavedActions"><Link className="secondaryButton actionLink" href={`/capture?customerId=${encodeURIComponent(customerId)}`}>続けて覚える</Link><Link className="captureSavedRecall" href={tabHref(customerId, "about")}>要点を確認する ›</Link></div></div>}

    {activeTab === "about" && <section className="customerMemoryOverview customerTabPanel" id="about">
      <div className="sectionTitle customerSectionTitle customerMemoryTitle"><span>今、思い出したいこと</span><Link className="subtle" href={`/remember?customerId=${customerId}`}>追加・訂正 ›</Link></div>
      <div className="card customerMemoryFocus customerMemoryFocusDense">{highlights.length > 0 ? <div className="customerHighlightList">{highlights.map(item => <div className="customerHighlightRow" key={`${item.label}-${item.value}`}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div> : <div className="customerCompactEmpty">まだ要約できる人物情報がありません。</div>}</div>
      <section className="customerFollowupSection" id="followup">
        <div className="sectionTitle customerSectionTitle"><span>次回の約束・フォロー</span>{followupAllowed && <Link className="subtle" href={`/people/${customerId}/next-actions`}>管理 ›</Link>}</div>
        {followupAllowed ? <Link className="card customerCompactRow" href={`/people/${customerId}/next-actions`}><span>{openNext.length > 0 ? `${openNext.length}件` : "未完了なし"}</span><strong>{openNext[0] ? `${compactText(openNext[0].text, 36)}${dueLabel(openNext[0].dueAt) ? ` · ${dueLabel(openNext[0].dueAt)}` : ""}` : "次にすることを追加"}</strong><i>›</i></Link> : <Link className="card customerCompactRow customerLockedRow" href="/plans"><span>🔒 Pro</span><strong>次回の約束・フォロー</strong><i>›</i></Link>}
      </section>
    </section>}

    {activeTab === "basic" && <section className="customerBasicSection customerTabPanel" id="basic">
      <div className="sectionTitle customerSectionTitle"><span>基本情報</span><Link className="subtle" href={`/remember?customerId=${customerId}`}>編集 ›</Link></div>
      {basicProfileGroup ? <div className="card customerBasicInfoCard">{basicProfileGroup.rows.map(row => <div className="customerBasicInfoRow" key={`${row.label}-${row.value}`}><span>{row.label}</span><strong>{row.value}</strong></div>)}</div> : <Link className="card customerCompactRow" href={`/remember?customerId=${customerId}`}><span>基本情報を追加</span><strong>誕生日や住まいなどを覚える</strong><i>›</i></Link>}
    </section>}

    {activeTab === "profile" && <section className="customerProfileSection customerTabPanel" id="profile">
      <div className="sectionTitle customerSectionTitle"><span>人物情報</span><Link className="subtle" href={`/remember?customerId=${customerId}`}>編集 ›</Link></div>
      {detailProfileGroups.length > 0 ? <div className="card customerProfilePreview">{detailProfileGroups.slice(0, 4).map(group => <div className="customerProfileGroup" key={group.title}><strong>{group.title}</strong><div>{group.rows.slice(0, 2).map(row => <span key={`${row.label}-${row.value}`}>{row.label}：{row.value}</span>)}</div></div>)}{detailProfileGroups.length > 4 && <details className="customerProfileMore"><summary>すべての人物情報を見る（{detailProfileGroups.length}カテゴリ） <span>›</span></summary><div className="customerProfileMoreBody">{detailProfileGroups.slice(4).map(group => <div className="customerProfileGroup" key={group.title}><strong>{group.title}</strong><div>{group.rows.map(row => <span key={`${row.label}-${row.value}`}>{row.label}：{row.value}</span>)}</div></div>)}</div></details>}</div> : <Link className="card customerCompactRow" href={`/remember?customerId=${customerId}`}><span>人物情報を追加</span><strong>好きなものや特徴を覚える</strong><i>›</i></Link>}
    </section>}

    {activeTab === "history" && <section className="customerRecentSection customerTabPanel" id="history">
      <div className="sectionTitle customerSectionTitle"><span>最近の出来事</span><span className="subtle">{visibleTimeline.length}件</span></div>
      {recentTimeline.length > 0 ? <>{access.integratedTimeline ? <ProTimelineRows items={recentTimeline}/> : <FreeHistoryRows items={recentTimeline} customerId={customerId}/>} {access.integratedTimeline && olderTimeline.length > 0 && <details className="customerHistoryMore"><summary>以前の出来事を見る（{olderTimeline.length}件）</summary><div className="customerHistoryMoreBody"><ProTimelineRows items={olderTimeline}/></div></details>}</> : <div className="card customerCompactEmpty">まだ出来事はありません</div>}
      {!access.integratedTimeline && archivedCount > 0 && <Link className="customerArchiveNote" href="/plans">🔒 過去の出来事 {archivedCount}件 · Pro</Link>}
      <section className="customerMediaSection">
        <div className="sectionTitle customerSectionTitle"><span>思い出の画像</span></div>
        {access.imagesAllowed ? <CustomerMediaPanel customerId={customerId} initialItems={mediaItems}/> : <Link className="card customerCompactRow customerLockedRow" href="/plans"><span>🔒 Pro</span><strong>画像を追加</strong><i>›</i></Link>}
      </section>
    </section>}

    <BottomNav/>
  </main>;
}
