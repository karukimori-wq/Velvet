import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const policy=read("lib/memory-tag-policy.ts");
const organize=read("app/capture/organize/[captureId]/actions.ts");
const remember=read("app/remember/remember-actions.ts");
const recall=read("lib/customer-recall.ts");
const timeline=read("lib/professional-timeline-repository.ts");
const required=[
 [policy,'"accumulate"','memory policy supports accumulated facts'],
 [policy,'"replace"','memory policy supports current-state replacement'],
 [policy,'describeMemoryTagChanges','memory changes are described'],
 [organize,'mergeMemoryTags','chat/AI path uses shared merge policy'],
 [organize,'addProfessionalTimelineItem','chat/AI path records timeline changes'],
 [remember,'mergeMemoryTags','field-entry path uses shared merge policy'],
 [remember,'addProfessionalTimelineItem','field-entry corrections preserve history'],
 [recall,'freshnessForTag','recall applies freshness'],
 [timeline,'order by occurred_at desc','timeline keeps newest events first']
];
const failures=required.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failures.length){console.error("Repeat visit flow check failed\n"+failures.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Repeat visit flow check passed: first visit → repeat learning → change/correction → timeline → fresh recall.");
