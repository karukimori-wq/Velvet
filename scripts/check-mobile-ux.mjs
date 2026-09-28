import fs from "node:fs";
const css=fs.readFileSync("app/mobile-fixes.css","utf8");
const theme=fs.readFileSync("app/velvet-theme.css","utf8");
const polish=fs.readFileSync("app/ux-polish.css","utf8");
const refresh=fs.readFileSync("app/ui-ux-refresh.css","utf8");
const surfacePolish=fs.readFileSync("app/surface-polish.css","utf8");
const capturePolish=fs.readFileSync("app/capture-polish.css","utf8");
const layout=fs.readFileSync("app/layout.tsx","utf8");
const nav=fs.readFileSync("components/bottom-nav.tsx","utf8");
const header=fs.readFileSync("components/app-header.tsx","utf8");
const home=fs.readFileSync("app/page.tsx","utf8");
const people=fs.readFileSync("app/people/page.tsx","utf8");
const detail=fs.readFileSync("app/people/[customerId]/page.tsx","utf8");
const search=fs.readFileSync("app/search/page.tsx","utf8");
const add=fs.readFileSync("app/add/page.tsx","utf8");
const newCustomerDetails=fs.readFileSync("components/new-customer-details.tsx","utf8");
const addForm=fs.readFileSync("components/add-customer-form.tsx","utf8");
const schedule=fs.readFileSync("app/schedule/page.tsx","utf8");
const settings=fs.readFileSync("app/settings/page.tsx","utf8");
const capture=fs.readFileSync("app/capture/page.tsx","utf8");
const picker=fs.readFileSync("components/capture-person-picker.tsx","utf8");
const composer=fs.readFileSync("components/capture-chat-input.tsx","utf8");
const composerForm=fs.readFileSync("components/capture-composer-form.tsx","utf8");
const rememberFields=fs.readFileSync("lib/remember-fields.ts","utf8");
const captureAction=fs.readFileSync("app/capture/organize/actions.ts","utf8");
const organize=fs.readFileSync("app/capture/organize/[captureId]/page.tsx","utf8");
const organizeAction=fs.readFileSync("app/capture/organize/[captureId]/actions.ts","utf8");
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
 [refresh,"padding-bottom:calc(158px + env(safe-area-inset-bottom))","content clears fixed bottom navigation"],
 [refresh,".feedbackLauncher{bottom:calc(108px + env(safe-area-inset-bottom))","feedback launcher clears bottom navigation"],
 [layout,'import "./ui-ux-refresh.css"',"latest UX overrides are loaded"],
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
 [detail,">覚える</span>","customer detail remember action"],
 [detail,">思い出す</span>","customer detail recall action"],
 [detail,">次につなぐ</span>","customer detail next action"],
 [detail,'className="detailIdentity detailIdentityCompact"',"customer detail identity is compact"],
 [detail,'className="visitPrimaryAction"',"customer visit action is promoted above secondary actions"],
 [detail,'className="customerMemoryOverview" id="memories"',"customer recall and stored profile share one memory surface"],
 [detail,"今、思い出したいこと","customer quick recall purpose is explicit"],
 [detail,"覚えている情報","customer full profile is clearly named"],
 [refresh,".customerDetailShell .detailIdentityCompact","compact customer detail styling"],
 [refresh,".customerDetailShell .customerMemoryDetails>summary","collapsed full profile styling"],
 [detail,'"これまでの出来事":"最近の出来事"',"history is clearly a viewing surface"],
 [detail,"scheduleAdded","saved schedule confirmation"],
 [detail,"giftAdded","saved gift confirmation"],
 [detail,"続けて覚える","post-save continuation action"],
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
 [detail,"この人を思い出す","customer detail exposes competing recall/profile headings"]
];
const failed=[
 ...checks.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`),
 ...blocked.filter(([text,needle])=>text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`)
];
if(failed.length){console.error("Mobile UX guard failed\n"+failed.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Mobile UX guard passed. Physical iPhone verification is still required for final UX sign-off.");
