import fs from "node:fs";

const upload = fs.readFileSync("app/api/media/upload/route.ts", "utf8");
const object = fs.readFileSync("app/api/media/object/route.ts", "utf8");
const status = fs.readFileSync("app/api/media/status/route.ts", "utf8");
const timeline = fs.readFileSync("lib/professional-timeline-repository.ts", "utf8");

const requiredUpload = [
  "getCustomerMemory",
  "CUSTOMER_REFERENCE_NOT_FOUND",
  "matchesImageSignature",
  "IMAGE_CONTENT_MISMATCH",
  "addProfessionalTimelineItem",
  "eventType: \"media\"",
  "sourceRef: `r2:${key}`",
  "bucket.delete(key)",
  "MEDIA_REGISTRATION_FAILED",
  "velvet.media.uploaded.v1",
];

const requiredObject = [
  "belongsToCurrentScope",
  "MEDIA_SCOPE_FORBIDDEN",
  "MEDIA_KEY_REQUIRED",
  "MEDIA_CUSTOMER_REQUIRED",
  "listProfessionalTimeline",
  "MEDIA_REFERENCE_NOT_FOUND",
  "item.eventType === \"media\"",
  "item.sourceRef === `r2:${key}`",
  "getMediaAccess",
  "bucket.get(resolved.key)",
  "export async function DELETE",
  "bucket.delete(resolved.key)",
  "deleteProfessionalTimelineItem",
  "velvet.media.deleted.v1",
  "x-velvet-media-key",
];

const requiredTimeline = [
  "export async function deleteProfessionalTimelineItem",
  "delete from velvet_professional_timeline where id=? and workspace_id=? and user_id=? and customer_id=?",
  "delete from velvet_professional_timeline where id=$1 and workspace_id=$2 and user_id=$3 and customer_id=$4",
];

const requiredStatus = [
  "retrievalReady",
  "retrievalEndpoint",
  "ownershipBoundary",
];

function assertContains(source, values, label) {
  const missing = values.filter(value => !source.includes(value));
  if (missing.length) {
    throw new Error(`${label} missing required media access guard markers: ${missing.join(", ")}`);
  }
}

assertContains(upload, requiredUpload, "upload route");
assertContains(object, requiredObject, "object route");
assertContains(timeline, requiredTimeline, "timeline repository");
assertContains(status, requiredStatus, "status route");

if (/public-read|publicRead|acl/i.test(upload + object)) {
  throw new Error("Media routes must not enable public object access.");
}

console.log("Media access check passed: upload validation, rollback, registered retrieval, scoped deletion, and ownership guards are present.");
