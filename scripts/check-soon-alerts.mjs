import fs from "node:fs";

const plan = fs.readFileSync(new URL("../lib/plan-access.ts", import.meta.url), "utf8");
const soon = fs.readFileSync(new URL("../lib/soon-alerts.ts", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const settings = fs.readFileSync(new URL("../app/settings/page.tsx", import.meta.url), "utf8");
const prefs = fs.readFileSync(new URL("../lib/owner-preferences.ts", import.meta.url), "utf8");
const schema = fs.readFileSync(new URL("../cloudflare/schema.sql", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../db/012_owner_preferences.sql", import.meta.url), "utf8");

const checks = [
  ["Pro enables soon alerts", /plan === ["']pro["'][\s\S]*?soonAlertsAllowed:\s*true/.test(plan)],
  ["Free disables soon alerts", /plan:\s*["']free["'][\s\S]*?soonAlertsAllowed:\s*false/.test(plan)],
  ["Soon alerts use visit events", /eventType === ["']visit["']/.test(soon)],
  ["Soon alerts require at least two visits", /visits\.length < 2/.test(soon)],
  ["Home renders soon section", /sectionTitle[\s\S]*そろそろ/.test(home)],
  ["Home respects preference toggle", /preferences\.soonAlertsEnabled/.test(home)],
  ["Settings exposes soon toggle", /setSoonAlertsAction/.test(settings) && /ONにする/.test(settings) && /OFFにする/.test(settings)],
  ["Owner preferences persist soon setting", /setSoonAlertsEnabled/.test(prefs) && /velvet_owner_preferences/.test(prefs)],
  ["D1 schema has owner preferences", /CREATE TABLE IF NOT EXISTS velvet_owner_preferences/.test(schema)],
  ["Postgres migration has owner preferences", /CREATE TABLE IF NOT EXISTS velvet_owner_preferences/.test(migration)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`\nSoon alert guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log("\nSoon alert guard passed.");
