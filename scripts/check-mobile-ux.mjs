import fs from "node:fs";
const css=fs.readFileSync("app/mobile-fixes.css","utf8");
const nav=fs.readFileSync("components/bottom-nav.tsx","utf8");
const composer=fs.readFileSync("components/capture-chat-input.tsx","utf8");
const checks=[
 [css,"safe-area-inset-bottom","safe-area bottom spacing"],
 [css,"grid-template-columns:repeat(5,1fr)","five-item bottom navigation"],
 [css,"touch-action:manipulation","tap responsiveness"],
 [css,"font-size:16px!important","iOS datetime zoom prevention"],
 [css,"min-height:48px","composer touch target"],
 [css,"-webkit-overflow-scrolling:touch","horizontal stamp scrolling"],
 [nav,"captureNav","larger center add action"],
 [composer,"webkitSpeechRecognition","iPhone/Safari speech fallback"],
 [composer,"stampGrid","stamp palette"]
];
const failed=checks.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failed.length){console.error("Mobile UX guard failed\n"+failed.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Mobile UX guard passed. Physical iPhone verification is still required for final UX sign-off.");
