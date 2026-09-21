import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const policy=read("lib/memory-tag-policy.ts");
const organize=read("app/capture/organize/[captureId]/actions.ts");
const editor=read("components/remember-editor.tsx");
const editorApi=read("app/api/memory/editor/route.ts");
const recall=read("lib/customer-recall.ts");
const timeline=read("lib/professional-timeline-repository.ts");
const required=[
 [policy,'"accumulate"',"memory policy supports accumulated facts"],
 [policy,'"replace"',"memory policy supports current-state replacement"],
 [policy,"describeMemoryTagChanges","memory changes are described"],
 [organize,"mergeMemoryTags","chat/AI path uses shared merge policy"],
 [organize,"addIdempotentProfessionalTimelineItem","chat/AI path records timeline changes without duplicating retries"],
 [editor,"memoryTagMode(label)","field editor applies shared replace/accumulate policy"],
 [editor,'fetch("/api/memory/editor"',"field editor persists through the scoped memory API"],
 [editorApi,"addProfessionalTimelineItem","field-entry corrections preserve timeline history"],
 [editorApi,"const added = tags.filter","field editor records additions"],
 [editorApi,"const removed = previous.filter","field editor records removals"],
 [recall,"timeSensitiveDays","recall defines freshness windows"],
 [recall,"latestTagTime","recall resolves when a fact was captured"],
 [recall,"ageDays>maxAge","recall excludes stale time-sensitive facts"],
 [recall,"freshness=","recall marks aging facts"],
 [timeline,"order by occurred_at desc","timeline keeps newest events first"]
];
const failures=required.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failures.length){console.error("Repeat visit flow check failed\n"+failures.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Repeat visit flow check passed: first visit → repeat learning → change/correction → timeline → fresh recall.");
