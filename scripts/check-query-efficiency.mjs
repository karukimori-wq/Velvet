import fs from "node:fs";

const people=fs.readFileSync("app/people/page.tsx","utf8");
const home=fs.readFileSync("app/page.tsx","utf8");
const timeline=fs.readFileSync("lib/professional-timeline-repository.ts","utf8");
const nextActions=fs.readFileSync("lib/professional-next-action-repository.ts","utf8");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};

assert(people.includes("listVisitTimelinesByCustomer"),"People must batch visit-history discovery");
assert(people.includes("listNextActionsByCustomer"),"People must batch Pro follow-up discovery");
assert(!/ids\.map\([\s\S]{0,180}listProfessionalTimeline/.test(people),"People must not issue one full timeline query per customer");
assert(!/ids\.map\([\s\S]{0,180}listNextActions\(/.test(people),"People must not issue one next-action query per customer");
assert(home.includes("listVisitTimelinesByCustomer"),"Home must batch visit cadence reads");
assert(!/allCustomerIds\.map\([\s\S]{0,220}listProfessionalTimeline/.test(home),"Home must not issue one timeline query per customer");
assert(timeline.includes("D1_ID_CHUNK")&&timeline.includes("customer_id in (${placeholders})"),"Timeline repository must chunk D1 customer-id batches");
assert(nextActions.includes("D1_ID_CHUNK")&&nextActions.includes("customer_id in (${placeholders})"),"Next-action repository must chunk D1 customer-id batches");

if(failures.length){console.error("Query efficiency guard failed:\n- "+failures.join("\n- "));process.exit(1)}
console.log("Query efficiency guard passed: Home/People use chunked batch reads instead of per-customer D1 fan-out.");
