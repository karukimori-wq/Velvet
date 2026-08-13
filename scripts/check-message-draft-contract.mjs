import fs from "node:fs";

const adapter = fs.readFileSync("lib/message-draft.ts", "utf8");
const action = fs.readFileSync("app/people/[customerId]/message/actions.ts", "utf8");
const statusRoute = fs.readFileSync("app/api/message-drafts/status/route.ts", "utf8");

const failures = [];
const requireIn = (source, needle, label) => {
  if (!source.includes(needle)) failures.push(`missing ${label}: ${needle}`);
};
const forbidIn = (source, needle, label) => {
  if (source.includes(needle)) failures.push(`forbidden ${label}: ${needle}`);
};

for (const field of ["workspaceId", "userId", "sourceApp", "targetStudio", "channel", "purpose", "audienceSegment", "tone", "cta", "inputRef"]) {
  requireIn(adapter, `${field}:`, `MessageDraft request field ${field}`);
}

requireIn(adapter, "/api/message-drafts", "formal MessageDraft HTTP mapping");
requireIn(adapter, 'operation: "MessageDraft.Generate"', "formal operation name");
requireIn(adapter, 'sourceApp: "velvet"', "sourceApp");
requireIn(adapter, 'targetStudio: "velvet"', "targetStudio");
requireIn(adapter, '"success", "warning", "error", "skipped"', "observability status enum");
for (const field of ["messageDraftId", "messageDraftStatus", "eventName", "traceId", "correlationId", "requestId"]) {
  requireIn(adapter, field, `response field ${field}`);
}

requireIn(action, 'inputRef: `velvet:customer:${customerId}`', "reference-only inputRef");
requireIn(action, 'audienceSegment: "individual_customer"', "audience segment");

for (const forbidden of ["paymentStatus", "salesAmount", "stripeSecret", "stripe_secret", "fullMeetingTranscript", "conversationSummary", "preferenceNote", "cautionNote", "lastInteractionSummary"]) {
  forbidIn(action, forbidden, "MessageDraft handoff data");
}

requireIn(statusRoute, 'contract: "approved"', "approved contract status");
requireIn(statusRoute, 'operation: "MessageDraft.Generate"', "status operation");

if (failures.length) {
  console.error("MessageDraft contract check failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("MessageDraft contract check passed");
