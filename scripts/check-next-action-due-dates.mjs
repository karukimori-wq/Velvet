import fs from "node:fs";

const repo = fs.readFileSync(new URL("../lib/professional-next-action-repository.ts", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../app/people/[customerId]/next-actions/page.tsx", import.meta.url), "utf8");
const home = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const actions = fs.readFileSync(new URL("../app/people/[customerId]/next-actions/actions.ts", import.meta.url), "utf8");
const schema = fs.readFileSync(new URL("../cloudflare/schema.sql", import.meta.url), "utf8");
const migration = fs.readFileSync(new URL("../db/013_next_action_due_at.sql", import.meta.url), "utf8");
const productionWorkflow = fs.readFileSync(new URL("../.github/workflows/cloudflare-production.yml", import.meta.url), "utf8");

const checks = [
  ["Next action type has dueAt", /dueAt\?:\s*string/.test(repo)],
  ["Repository maps due_at", /due_at/.test(repo) && /dueAt:r\.due_at/.test(repo)],
  ["Repository orders open due followups first", /due_at asc/.test(repo)],
  ["Repository can list due followups across customers", /listDueNextActions/.test(repo) && /status='open' and due_at is not null/.test(repo)],
  ["Create action accepts due date", /dueAtFromForm/.test(actions) && /createNextAction\(workspaceId,userId,customerId,text,dueAtFromForm\(formData\)\)/.test(actions)],
  ["UI exposes due date input", /name=\"dueDate\"/.test(page) && /期限付きフォロー/.test(page)],
  ["UI states no notification", /通知は送らず/.test(page)],
  ["Home shows Pro due followups", /hasVelvetFeature\(access,\s*"followup\.manage"\)/.test(home) && /listDueNextActions/.test(home) && /忘れない/.test(home)],
  ["D1 schema includes due_at", /velvet_professional_next_actions[\s\S]*due_at TEXT/.test(schema)],
  ["Existing D1 table has conditional due_at migration", /pragma_table_info\('velvet_professional_next_actions'\)/.test(productionWorkflow) && /ALTER TABLE velvet_professional_next_actions ADD COLUMN due_at TEXT/.test(productionWorkflow)],
  ["Postgres migration adds due_at", /ALTER TABLE velvet_professional_next_actions ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ/.test(migration)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`\nNext action due-date guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log("\nNext action due-date guard passed.");
