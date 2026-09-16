import fs from "node:fs";
const css=fs.readFileSync("app/mobile-fixes.css","utf8");
const theme=fs.readFileSync("app/velvet-theme.css","utf8");
const polish=fs.readFileSync("app/ux-polish.css","utf8");
const capturePolish=fs.readFileSync("app/capture-polish.css","utf8");
const nav=fs.readFileSync("components/bottom-nav.tsx","utf8");
const detail=fs.readFileSync("app/people/[customerId]/page.tsx","utf8");
const composer=fs.readFileSync("components/capture-chat-input.tsx","utf8");
const organize=fs.readFileSync("app/capture/organize/[captureId]/page.tsx","utf8");
const organizeAction=fs.readFileSync("app/capture/organize/[captureId]/actions.ts","utf8");
const checks=[
 [css,"safe-area-inset-bottom","safe-area bottom spacing"],
 [theme,"grid-template-columns:repeat(4,1fr)","four-item daily bottom navigation"],
 [css,"touch-action:manipulation","tap responsiveness"],
 [css,"font-size:16px!important","iOS datetime zoom prevention"],
 [css,"min-height:48px","composer touch target"],
 [css,"-webkit-overflow-scrolling:touch","horizontal stamp scrolling"],
 [nav,"navActive","active bottom navigation state"],
 [nav,'["＋", "覚える", "/capture"]',"explicit remember action label"],
 [nav,"captureNav","prominent remember action hook"],
 [polish,".bottomNav .captureNav strong","prominent remember button styling"],
 [detail,">覚える</span>","customer detail remember action"],
 [detail,">思い出す</span>","customer detail recall action"],
 [detail,">次につなぐ</span>","customer detail next action"],
 [detail,'id="memories"',"customer detail recall destination"],
 [detail,'"これまでの出来事":"最近の出来事"',"history is clearly a viewing surface"],
 [detail,"scheduleAdded","saved schedule confirmation"],
 [detail,"giftAdded","saved gift confirmation"],
 [detail,"続けて覚える","post-save continuation action"],
 [composer,"webkitSpeechRecognition","iPhone/Safari speech fallback"],
 [composer,"stampGrid","stamp palette"],
 [organize,"この内容で覚える","clear review confirmation action"],
 [organize,"保存して、続けて覚える","review continuation action"],
 [organize,"入力を直す","review correction action"],
 [capturePolish,".organizeConfirm","mobile review action container"],
 [capturePolish,"position:sticky","review actions remain reachable"],
 [organizeAction,'redirect(`/people/${capture.customerId}?${params.toString()}`)',"save returns to customer detail"]
];
const failed=checks.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failed.length){console.error("Mobile UX guard failed\n"+failed.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Mobile UX guard passed. Physical iPhone verification is still required for final UX sign-off.");
