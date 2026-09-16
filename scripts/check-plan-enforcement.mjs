import fs from "node:fs";

const source = fs.readFileSync(new URL("../lib/plan-access.ts", import.meta.url), "utf8");
const spec = fs.readFileSync(new URL("../docs/plan-enforcement-spec.md", import.meta.url), "utf8");
const billing = fs.readFileSync(new URL("../lib/billing-readiness.ts", import.meta.url), "utf8");
const searchPage = fs.readFileSync(new URL("../app/search/page.tsx", import.meta.url), "utf8");
const capturesApi = fs.readFileSync(new URL("../app/api/captures/route.ts", import.meta.url), "utf8");
const giftsApi = fs.readFileSync(new URL("../app/api/gifts/route.ts", import.meta.url), "utf8");
const visitApi = fs.readFileSync(new URL("../app/api/visits/[visitId]/route.ts", import.meta.url), "utf8");
const visitPage = fs.readFileSync(new URL("../app/visits/[visitId]/page.tsx", import.meta.url), "utf8");
const organizePage = fs.readFileSync(new URL("../app/capture/organize/[captureId]/page.tsx", import.meta.url), "utf8");
const organizeAction = fs.readFileSync(new URL("../app/capture/organize/[captureId]/actions.ts", import.meta.url), "utf8");

const checks = [
  ["Free customer limit is 30", /customerLimit:\s*30/.test(source)],
  ["Free history window is 3 months", /setUTCMonth\(cutoff\.getUTCMonth\(\)\s*-\s*3\)/.test(source)],
  ["Free integrated timeline is disabled", /plan:\s*["']free["'][\s\S]*?integratedTimeline:\s*false/.test(source)],
  ["Free event views are disabled", /plan:\s*["']free["'][\s\S]*?eventViews:\s*false/.test(source)],
  ["Free attachments are disabled", /plan:\s*["']free["'][\s\S]*?attachmentsAllowed:\s*false/.test(source)],
  ["Free image uploads are disabled", /plan:\s*["']free["'][\s\S]*?imagesAllowed:\s*false/.test(source)],
  ["Free voice capture is disabled", /plan:\s*["']free["'][\s\S]*?voiceCaptureAllowed:\s*false/.test(source)],
  ["Free message draft is disabled", /plan:\s*["']free["'][\s\S]*?messageDraftAllowed:\s*false/.test(source)],
  ["Pro full history is enabled", /plan === ["']pro["'][\s\S]*?fullHistory:\s*true/.test(source)],
  ["Pro integrated timeline is enabled", /plan === ["']pro["'][\s\S]*?integratedTimeline:\s*true/.test(source)],
  ["Pro event views are enabled", /plan === ["']pro["'][\s\S]*?eventViews:\s*true/.test(source)],
  ["Pro attachments are enabled", /plan === ["']pro["'][\s\S]*?attachmentsAllowed:\s*true/.test(source)],
  ["Pro voice capture is enabled", /plan === ["']pro["'][\s\S]*?voiceCaptureAllowed:\s*true/.test(source)],
  ["Pro message draft is enabled", /plan === ["']pro["'][\s\S]*?messageDraftAllowed:\s*true/.test(source)],
  ["Pro price target is 990", /990 JPY \/ month/.test(spec) && /proPriceTargetJpy:\s*990/.test(billing)],
  ["Advanced search is gated by plan", /advancedSearchAllowed/.test(searchPage) && /hasVelvetFeature\(access,\s*["']history\.search["']\)/.test(searchPage)],
  ["Free search stays profile-only", /captureResults\s*=\s*advancedSearchAllowed\s*&&\s*terms\.length/.test(searchPage) && /giftResults\s*=\s*advancedSearchAllowed\s*&&\s*terms\.length/.test(searchPage)],
  ["Capture API enforces Free history window", /getPlanAccess\(ownerUserId\)/.test(capturesApi) && /isWithinHistoryWindow\(capture\.createdAt,\s*access\)/.test(capturesApi)],
  ["Visit detail API enforces completed Free history window", /getPlanAccess\(ownerUserId\)/.test(visitApi) && /visit\.endedAt\s*&&\s*!isWithinHistoryWindow\(visit\.visitedAt,\s*access\)/.test(visitApi) && /PRO_REQUIRED/.test(visitApi)],
  ["Visit page filters recall captures by Free history window", /visibleCaptures\s*=\s*captures\.filter\(capture\s*=>\s*isWithinHistoryWindow\(capture\.createdAt,\s*access\)\)/.test(visitPage) && /captures:\s*visibleCaptures/.test(visitPage)],
  ["Visit page locks completed visits outside Free history", /!visit\.endedAt\s*\|\|\s*isWithinHistoryWindow\(visit\.visitedAt,\s*access\)/.test(visitPage)],
  ["Capture organize page blocks old Free captures before AI", /!isWithinHistoryWindow\(capture\.createdAt,\s*access\)/.test(organizePage) && organizePage.indexOf("history_window") < organizePage.indexOf("structureCapture(capture.value")],
  ["Capture organize mutation blocks old Free captures", /getPlanAccess\(ownerUserId\)/.test(organizeAction) && /!isWithinHistoryWindow\(capture\.createdAt,\s*access\)/.test(organizeAction)],
  ["Gift history API is Pro gated", /hasVelvetFeature\(access,\s*["']history\.gifts["']\)/.test(giftsApi) && /PRO_REQUIRED/.test(giftsApi)],
  ["Business integrations cannot be enabled", /feature === ["']business\.integrations["']\) return false/.test(source)],
  ["Business remains unavailable", /plan === ["']business["'][\s\S]*?businessAvailable:\s*false/.test(source)],
  ["Plan spec says Business is not purchasable", /Business[\s\S]{0,300}(not purchasable|購入不可)/i.test(spec)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`\nPlan enforcement guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log("\nPlan enforcement guard passed.");
