import fs from "node:fs";
const css=fs.readFileSync("app/mobile-fixes.css","utf8");
const theme=fs.readFileSync("app/velvet-theme.css","utf8");
const polish=fs.readFileSync("app/ux-polish.css","utf8");
const nav=fs.readFileSync("components/bottom-nav.tsx","utf8");
const detail=fs.readFileSync("app/people/[customerId]/page.tsx","utf8");
const composer=fs.readFileSync("components/capture-chat-input.tsx","utf8");
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
 [composer,"webkitSpeechRecognition","iPhone/Safari speech fallback"],
 [composer,"stampGrid","stamp palette"]
];
const failed=checks.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failed.length){console.error("Mobile UX guard failed\n"+failed.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Mobile UX guard passed. Physical iPhone verification is still required for final UX sign-off.");
