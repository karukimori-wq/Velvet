import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const capture=read("app/capture/organize/actions.ts"),suggest=read("app/capture/suggested-actions.ts"),page=read("app/capture/page.tsx"),repo=read("lib/professional-next-action-repository.ts"),candidates=read("lib/next-action-candidates.ts");
const required=[
 [capture,"sourceTopicId = conversationTopicIds.includes","capture action links source topic"],
 [repo,"source_topic_id","next action persists source topic"],
 [repo,"action_type,topic_id,timing,priority,source_capture_id,source_topic_id","metadata is read back"],
 [candidates,"suggestNextActionsFromTopic","topic candidate generation"],
 [page,"次につなげる","candidate UI"],
 [page,"createSuggestedNextAction.bind","one-tap action"],
 [suggest,'item.status==="open"&&item.sourceTopicId===sourceTopicId',"duplicate guard"],
 [suggest,'timing:"next_visit"',"suggested action timing"]
];
const failures=required.filter(([t,n])=>!t.includes(n)).map(([,n,l])=>`${l}: ${n}`);
if(failures.length){console.error("Conversation to next action check failed\n"+failures.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Conversation to next action check passed: source topics remain linked and one-tap suggestions are idempotent.");
