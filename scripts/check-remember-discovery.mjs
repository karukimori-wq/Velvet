import fs from "node:fs";const input=fs.readFileSync("components/capture-chat-input.tsx","utf8"),page=fs.readFileSync("app/capture/page.tsx","utf8");
const required=[[input,'type="search"',"search"],[input,"recentFieldLabels","recent"],[input,"frequentFieldLabels","frequent"],[input,"よく使う","frequent label"],[page,"fieldCounts","frequency aggregation"],[page,"count>=2","frequency threshold"]];
const failed=required.filter(([t,n])=>!t.includes(n)).map(([,n,l])=>`${l}: ${n}`);if(failed.length){console.error(failed.join("\n"));process.exit(1)}console.log("Remember discovery check passed.");
