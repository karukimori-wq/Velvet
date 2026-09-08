import fs from "node:fs";

const source = fs.readFileSync(new URL("../lib/plan-access.ts", import.meta.url), "utf8");
const spec = fs.readFileSync(new URL("../docs/plan-enforcement-spec.md", import.meta.url), "utf8");

const checks = [
  ["Free customer limit is 30", /customerLimit:\s*30/.test(source)],
  ["Free history window is 3 months", /setUTCMonth\(cutoff\.getUTCMonth\(\)\s*-\s*3\)/.test(source)],
  ["Free integrated timeline is disabled", /plan:\s*["']free["'][\s\S]*?integratedTimeline:\s*false/.test(source)],
  ["Free event views are disabled", /plan:\s*["']free["'][\s\S]*?eventViews:\s*false/.test(source)],
  ["Free attachments are disabled", /plan:\s*["']free["'][\s\S]*?attachmentsAllowed:\s*false/.test(source)],
  ["Free image uploads are disabled", /plan:\s*["']free["'][\s\S]*?imagesAllowed:\s*false/.test(source)],
  ["Pro full history is enabled", /plan === ["']pro["'][\s\S]*?fullHistory:\s*true/.test(source)],
  ["Pro integrated timeline is enabled", /plan === ["']pro["'][\s\S]*?integratedTimeline:\s*true/.test(source)],
  ["Pro event views are enabled", /plan === ["']pro["'][\s\S]*?eventViews:\s*true/.test(source)],
  ["Pro attachments are enabled", /plan === ["']pro["'][\s\S]*?attachmentsAllowed:\s*true/.test(source)],
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
