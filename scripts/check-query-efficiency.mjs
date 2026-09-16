import fs from "node:fs";

const people=fs.readFileSync("app/people/page.tsx","utf8");
const home=fs.readFileSync("app/page.tsx","utf8");
const timeline=fs.readFileSync("lib/professional-timeline-repository.ts","utf8");
const nextActions=fs.readFileSync("lib/professional-next-action-repository.ts","utf8");
const recentCaptureCustomers=fs.readFileSync("lib/recent-capture-customers.ts","utf8");
const captureRepository=fs.readFileSync("lib/capture-repository.ts","utf8");
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
assert(recentCaptureCustomers.includes("GROUP BY customer_id ORDER BY MAX(created_at) DESC LIMIT ?"),"D1 recent-customer picker must aggregate in SQL instead of loading all captures");
assert(recentCaptureCustomers.includes("group by customer_id order by max(created_at) desc limit $3"),"Postgres recent-customer picker must aggregate in SQL instead of loading all captures");
const suggestionStart=captureRepository.indexOf("export async function getCaptureSuggestions");
const suggestionEnd=captureRepository.indexOf("export async function createCapture",suggestionStart);
const suggestionSource=captureRepository.slice(suggestionStart,suggestionEnd);
assert(suggestionStart>=0&&suggestionEnd>suggestionStart,"Capture suggestion implementation must be discoverable");
assert(suggestionSource.includes("listDictionaryEntries"),"Capture suggestions must use bounded dictionary data");
assert(!suggestionSource.includes("listCaptures("),"Capture suggestions must not load the full capture history");

if(failures.length){console.error("Query efficiency guard failed:\n- "+failures.join("\n- "));process.exit(1)}
console.log("Query efficiency guard passed: Home/People use chunked batch reads and capture shortcuts avoid full-history scans.");
