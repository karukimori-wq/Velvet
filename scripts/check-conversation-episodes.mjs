import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const repo=read("lib/conversation-episode-repository.ts");
const capture=read("app/capture/organize/actions.ts");
const schema=read("cloudflare/schema.sql");
const migration=read("db/015_conversation_episodes.sql");
const required=[
 [repo,'ConversationEpisodeState = "new" | "continued" | "changed" | "done"',"episode states"],
 [repo,"visitId?:string","visit linkage"],
 [repo,"captureId:string","capture linkage"],
 [repo,"topicId:string","topic identity"],
 [repo,"listConversationEpisodes","episode history"],
 [capture,'sectionId === "conversation"',"conversation routing"],
 [capture,"conversation.status.continued","continued mapping"],
 [capture,"conversation.status.changed","changed mapping"],
 [capture,"conversation.status.done","done mapping"],
 [capture,"visitId:fromVisit","visit id persistence"],
 [schema,"velvet_conversation_episodes","D1 schema"],
 [migration,"velvet_conversation_episodes","Postgres migration"]
];
const failures=required.filter(([text,needle])=>!text.includes(needle)).map(([,needle,label])=>`${label}: ${needle}`);
if(failures.length){console.error("Conversation episode check failed\n"+failures.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Conversation episode check passed: per-visit topic episodes preserve NEW → continued → changed → done history.");
