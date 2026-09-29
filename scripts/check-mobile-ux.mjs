import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");
const css=read("app/mobile-fixes.css");
const theme=read("app/velvet-theme.css");
const polish=read("app/ux-polish.css");
const refresh=read("app/ui-ux-refresh.css");
const density=read("app/customer-detail-density.css");
const surfacePolish=read("app/surface-polish.css");
const capturePolish=read("app/capture-polish.css");
const layout=read("app/layout.tsx");
const nav=read("components/bottom-nav.tsx");
const header=read("components/app-header.tsx");
const home=read("app/page.tsx");
const people=read("app/people/page.tsx");
const detail=read("app/people/[customerId]/page.tsx");
const media=read("components/customer-media-panel.tsx");
const search=read("app/search/page.tsx");
const add=read("app/add/page.tsx");
const newCustomerDetails=read("components/new-customer-details.tsx");
const addForm=read("components/add-customer-form.tsx");
const schedule=read("app/schedule/page.tsx");
const settings=read("app/settings/page.tsx");
const capture=read("app/capture/page.tsx");
const picker=read("components/capture-person-picker.tsx");
const composer=read("components/capture-chat-input.tsx");
const composerForm=read("components/capture-composer-form.tsx");
const rememberFields=read("lib/remember-fields.ts");
const captureAction=read("app/capture/organize/actions.ts");
const organize=read("app/capture/organize/[captureId]/page.tsx");
const organizeAction=read("app/capture/organize/[captureId]/actions.ts");

const checks=[
 [css,"safe-area-inset-bottom","safe-area bottom spacing"],
 [css,"grid-template-columns:repeat(5,1fr)","five-item daily bottom navigation"],
 [theme,":focus-visible","visible keyboard focus"],
 [theme,"prefers-reduced-motion:reduce","reduced-motion accessibility"],
 [css,"touch-action:manipulation","tap responsiveness"],
 [css,"font-size:16px!important","iOS datetime zoom prevention"],
 [css,"min-height:48px","composer touch target"],
 [css,"-webkit-overflow-scrolling:touch","horizontal stamp scrolling"],
 [nav,"navActive","active bottom navigation state"],
 [nav,'className="navLabel"',"balanced five-item navigation labels"],
 [polish,".navLabel","compact non-wrapping navigation labels"],
 [nav,'["plus", "覚える", "/add"]',"remember navigation opens the remember hub"],
 [nav,'pathname.startsWith("/capture")',"remember navigation stays active during capture"],
 [nav,"captureNav","prominent remember action hook"],
 [header,'drawerLink("plan", "プラン", "/plans")',"drawer keeps secondary plan navigation"],
 [header,'drawerLink("settings", "設定", "/settings")',"drawer keeps secondary settings navigation"],
 [header,"画面下のメニューからいつでも開けます","drawer explains primary navigation location"],
 [polish,".bottomNav .captureNav strong","prominent remember button styling"],
 [refresh,"padding-bottom:calc(158px + env(safe-area-inset-bottom))","general content clears fixed bottom navigation"],
 [layout,'import "./ui-ux-refresh.css"',"latest UX overrides are loaded"],
 [layout,'import "./customer-detail-density.css"',"customer detail density overrides are loaded last"],
 [home,'className="homeNext"',"home starts with next action"],
 [home,"次にすること","home next-action wording"],
 [home,"homeSummaryStrip","home metrics are compact summaries"],
 [people,"captureMiniAction","per-customer remember shortcut"],
 [people,"さんのことを覚える","customer remember shortcut accessibility"],
 [refresh,".captureMiniAction span","customer remember shortcut is visually compact"],
 [search,'<AppHeader title="思い出す" />',"recall search is a first-class app screen"],
 [search,"何を思い出しますか？","search intent covers people schedules and events"],
 [search,"予定・イベント","recall search includes schedule and event wording"],
 [search,"listScheduleEntries","recall search loads schedules"],
 [search,"recallSearchButton","recall has one primary search action"],
 [search,"recallExamples","recall provides search examples"],
 [search,"<BottomNav />","search keeps primary navigation"],
 [surfacePolish,".searchIntro","search mobile polish"],
 [add,'<AppHeader title="覚える"',"remember hub uses the remember title"],
 [add,"何を覚えますか？","remember hub explains its purpose"],
 [add,'href="/capture"',"customer choice continues to capture picker"],
 [add,"お客様から選ぶ","remember hub has a clear customer choice"],
 [add,"NewCustomerDetails","new customer registration remains available from the hub"],
 [newCustomerDetails,'id="new-customer"',"new customer disclosure has a stable hash target"],
 [newCustomerDetails,'window.location.hash==="#new-customer"',"new customer disclosure opens from the private-safe hash"],
 [surfacePolish,".rememberPrimaryChoice","remember hub primary choice is visually emphasized"],
 [addForm,"登録して、この人を覚える","new customer continues into memory"],
 [addForm,"useActionState","customer registration failures stay in-page"],
 [addForm,"入力内容はこの画面に残っています","customer registration preserves the entered name on upstream failure"],
 [schedule,"scheduleCustomerLink","schedule links back to customer context"],
 [schedule,"scheduleViewTabs","schedule supports day week month views"],
 [schedule,"scheduleMonthGrid","schedule keeps monthly calendar"],
 [schedule,'aria-current={view==="month"?"page":undefined}',"schedule exposes selected view accessibly"],
 [refresh,".filterPill.filterActive","schedule selected view is visually explicit"],
 [settings,'<AppHeader title="設定"/>',"settings uses app header"],
 [settings,"プッシュ通知やメールは送りません","display-only reminder wording"],
 [settings,"<BottomNav/>","settings keeps primary navigation"],

 [detail,'className="detailIdentity detailIdentityCompact"',"customer detail identity stays compact"],
 [detail,"customerStatusStrip","customer detail shows customer-specific status immediately"],
 [detail,"最終来店","customer detail exposes last visit"],
 [detail,"予定確認","customer detail exposes next schedule"],
 [detail,'className="visitPrimaryAction"',"customer visit action remains primary"],
 [detail,"customerContextActions","customer detail shortcuts are customer-scoped"],
 [detail,"人物情報","customer profile is explicit"],
 [detail,"次回の約束・フォロー","customer follow-up shortcut is explicit"],
 [detail,"予定確認","customer schedule shortcut is explicit"],
 [detail,'id="about"',"customer summary has a stable target"],
 [detail,"今、思い出したいこと","customer quick summary remains visible"],
 [detail,"customerHighlightList","customer quick summary uses compact label-value rows"],
 [detail,"customerProfilePreview","profile shows useful content before expansion"],
 [detail,"customerCompactTimeline","recent events use a compact timeline"],
 [detail,"slice(0, 8)","customer timeline caps the first view at eight items"],
 [detail,"customerLockedRow","Pro surfaces use compact locked rows"],
 [detail,"scheduleAdded","saved schedule confirmation remains supported"],
 [detail,"giftAdded","saved gift confirmation remains supported"],
 [detail,"続けて覚える","post-save continuation action remains supported"],
 [density,"padding-bottom:calc(210px + env(safe-area-inset-bottom))","customer detail clears the floating bottom navigation"],
 [density,"body:has(.customerDetailDense) .feedbackLauncher","customer detail feedback launcher gets a non-obtrusive treatment"],
 [density,".customerHighlightRow","customer memory summary uses dense rows"],
 [density,".customerTimelineRow","customer event history uses dense rows"],
 [media,'className="card customerMediaCompact"',"customer media is collapsed into a compact row"],

 [capture,"listRecentCaptureCustomerIds","capture picker uses recent customer context"],
 [capture,"listScheduleEntries","capture picker uses today's schedule context"],
 [picker,"今日会う人","today's customer shortcut"],
 [picker,"最近覚えた人","recent customer shortcut"],
 [picker,"名前・呼び名で探す","capture customer search"],
 [picker,"＋ 新しいお客様を追加","capture picker has no-dead-end add action"],
 [picker,'href="/add#new-customer"',"capture picker opens the new customer form directly"],
 [composer,"webkitSpeechRecognition","iPhone/Safari speech fallback"],
 [composer,"stampChoiceRow","stamp field choice flow"],
 [composer,"stampSectionChoices","three remember entry areas"],
 [rememberFields,"人物情報","profile remember entry label"],
 [rememberFields,"今日の会話","conversation remember entry label"],
 [rememberFields,"次のアクション","next action remember entry label"],
 [composerForm,"useActionState","capture save errors stay on the input screen"],
 [composerForm,"入力した内容はこの画面に残しています","capture failure explicitly preserves draft"],
 [composerForm,"保存しています…","capture pending feedback"],
 [rememberFields,"getRememberSections","visit phase remember ordering"],
 [rememberFields,"conversation.status.new","conversation status topic continuity"],
 [rememberFields,"nextActionRememberGroups","next action taxonomy"],
 [rememberFields,"topic.travel","shared topic id for duplicate UI entry"],
 [captureAction,'return { error: "save_failed" }',"capture persistence failure returns inline state"],
 [capturePolish,".captureInlineError","capture inline error styling"],
 [organize,"この内容で覚える","clear review confirmation action"],
 [organize,"保存して、続けて覚える","review continuation action"],
 [organize,"入力を直す","review correction action"],
 [capturePolish,".organizeConfirm","mobile review action container"],
 [capturePolish,"position:sticky","review actions remain reachable"],
 [organizeAction,'redirect(`/people/${capture.customerId}?${params.toString()}`)',"save returns to customer detail"]
];

const blocked=[
 [header,'["home", "ホーム", "/"]',"drawer duplicates home navigation"],
 [header,'["people", "顧客", "/people"]',"drawer duplicates customer navigation"],
 [header,'["plus", "覚える", "/capture"]',"drawer duplicates remember navigation"],
 [header,'["search", "思い出す", "/search"]',"drawer duplicates recall navigation"],
 [header,'["calendar", "予定", "/schedule"]',"drawer duplicates schedule navigation"],
 [nav,'["plus", "覚える", "/capture"]',"bottom remember navigation bypasses the remember hub"],
 [home,"metricGrid","home uses large dashboard metric grid"],
 [detail,"この人を思い出す","customer detail exposes competing recall/profile headings"],
 [detail,"覚えていることを、すぐ次の時間へ。","customer detail uses generic copy instead of customer-specific status"],
 [detail,"detailQuickActionsCompact","customer detail duplicates global navigation shortcuts"],
 [detail,"Proで利用できます","customer detail overstates Pro gating"],
 [detail,"quickRecallGrid","customer detail uses the old oversized recall grid"]
];

const failed=[
 ...checks.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`),
 ...blocked.filter(([text,needle])=>text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`)
];
if(failed.length){console.error("Mobile UX guard failed\n"+failed.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Mobile UX guard passed. Physical iPhone verification is still required for final UX sign-off.");
