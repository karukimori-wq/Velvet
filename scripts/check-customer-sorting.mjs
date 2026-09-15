import fs from "node:fs";
const page = fs.readFileSync(new URL("../app/people/page.tsx", import.meta.url), "utf8");
const spec = fs.readFileSync(new URL("../docs/plan-enforcement-spec.md", import.meta.url), "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

for (const token of ["soon", "due_followup", "open_followup", "そろそろ順", "フォロー期限が近い順", "未対応フォロー順"]) assert(page.includes(token), `Customer list sorting missing: ${token}`);
assert(page.includes("proSortValues") && page.includes("!proDiscoveryAllowed"), "Pro-only sorting must be gated for Free users");
assert(page.includes("hasVelvetFeature(access,\"followup.manage\")"), "Pro sorting must use plan access, not UI-only assumptions");
assert(page.includes("buildSoonVisitAlert") && page.includes("getOwnerPreferences"), "Soon sorting must reuse the existing soon-alert policy and user preference");
assert(page.includes("listNextActions") && page.includes("openFollowupCount") && page.includes("nextDueAt"), "Follow-up sorting must use open next actions and due dates");
assert(page.includes("disabled={proSortValues.has(value)&&!proDiscoveryAllowed}"), "Free users must not be able to select Pro-only sort options from the UI");
assert(/MVP sorting:[\s\S]*latest visit first[\s\S]*most visits first/.test(spec), "Plan spec must preserve MVP non-money sorting boundary");
assert(/Money-based sorting[\s\S]*Growth Engine/.test(spec), "Money-based sorting must stay behind Growth Engine/Business boundary");

if (failures.length) {
  console.error("Customer sorting guard failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Customer sorting guard passed: Pro discovery sorts are gated and money sorts remain out of Velvet.");
