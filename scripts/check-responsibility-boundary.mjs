import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const customerScopedFiles = [
  "lib/customer-memory-repository.ts",
  "lib/professional-visit-repository.ts",
  "lib/professional-timeline-repository.ts",
  "lib/capture-repository.ts",
  "lib/gift-repository.ts",
  "lib/schedule-repository.ts",
  "lib/relationship-repository.ts",
  "app/api/captures/route.ts",
  "app/api/gifts/route.ts",
  "app/api/visits/route.ts",
];

for (const path of customerScopedFiles) {
  const source = read(path);
  assert(source.includes("customerId") || source.includes("customer_id"), `${path}: canonical record must be customerId-scoped`);
  assert(!/\bpersonId\b|\bperson_id\b/.test(source), `${path}: canonical code must not use personId/person_id`);
}

const professionalVisit = read("lib/professional-visit-repository.ts");
for (const forbidden of ["salesAmount", "sales_amount", "paymentStatus", "payment_status", "paymentMethod", "payment_method", "receivable", "unpaidAmount", "collectedAmount", "stripe"]) {
  assert(!professionalVisit.toLowerCase().includes(forbidden.toLowerCase()), `Professional Visit contains forbidden Sales/Payment field: ${forbidden}`);
}

for (const path of ["lib/person-store.ts", "lib/visit-repository.ts"]) {
  const source = read(path).toLowerCase();
  const forbiddenWrites = [
    /insert\s+into\s+velvet_people/,
    /update\s+velvet_people/,
    /delete\s+from\s+velvet_people/,
    /insert\s+into\s+velvet_visits/,
    /update\s+velvet_visits/,
    /delete\s+from\s+velvet_visits/,
    /insert\s+into\s+velvet_visit_participants/,
    /update\s+velvet_visit_participants/,
    /delete\s+from\s+velvet_visit_participants/,
  ];
  for (const pattern of forbiddenWrites) assert(!pattern.test(source), `${path}: legacy table write detected (${pattern})`);
}

const peopleApi = read("app/api/people/route.ts");
assert(!peopleApi.includes("createPersonStore"), "People API must not create a Velvet Customer/Person master");
const contactsApi = read("app/api/contacts/route.ts");
assert(!contactsApi.includes("createPersonContact"), "Contacts API must not create Customer contact master data");

const importExport = read("lib/import-export.ts");
assert(!/createPersonStore|velvet_people|personId|person_id|contacts\s*:/i.test(importExport), "Import/export must not create or export Velvet Customer master/contact data");
assert(importExport.includes("customerId"), "Import/export must be customerId-scoped");

if (failures.length) {
  console.error("Responsibility boundary check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Responsibility boundary check passed.");
