import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const repo=read("lib/ongoing-topic-repository.ts"),capture=read("app/capture/organize/actions.ts"),page=read("app/capture/page.tsx"),schema=read("cloudflare/schema.sql"),migration=read("db/016_ongoing_topics.sql");
const required=[
 [repo,"upsertOngoingTopicFromEpisode","episode updates topic"],
 [repo,"firstEpisodeId","first episode retained"],
 [repo,"latestEpisodeId","latest episode retained"],
 [repo,"completedAt","completion retained"],
 [repo,"listOngoingTopics","active topic reader"],
 [capture,"upsertOngoingTopicFromEpisode(episode)","capture wiring"],
 [page,"listOngoingTopics","remember flow reads topics"],
 [page,"続いている話","ongoing topics visible"],
 [schema,"velvet_ongoing_topics","D1 schema"],
 [migration,"velvet_ongoing_topics","Postgres migration"]
];
const failures=required.filter(([t,n])=>!t.includes(n)).map(([,n,l])=>`${l}: ${n}`);
if(failures.length){console.error("Ongoing topic check failed\n"+failures.map(v=>`- ${v}`).join("\n"));process.exit(1)}
console.log("Ongoing topic check passed: episode history stays immutable while current topic state is surfaced.");
