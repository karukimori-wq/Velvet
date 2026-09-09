import fs from "node:fs";

const upload = fs.readFileSync("app/api/media/upload/route.ts", "utf8");
const object = fs.readFileSync("app/api/media/object/route.ts", "utf8");
const status = fs.readFileSync("app/api/media/status/route.ts", "utf8");

const requiredUpload = [
  "getCustomerMemory",
  "CUSTOMER_REFERENCE_NOT_FOUND",
  "addProfessionalTimelineItem",
  "eventType: \"media\"",
  "sourceRef: `r2:${key}`",
  "velvet.media.uploaded.v1",
];

const requiredObject = [
  "belongsToCurrentScope",
  "MEDIA_SCOPE_FORBIDDEN",
  "MEDIA_KEY_REQUIRED",
  "getMediaAccess",
  "bucket.get(key)",
  "x-velvet-media-key",
];

const requiredStatus = [
  "retrievalReady",
  "retrievalEndpoint",
  "ownershipBoundary",
];

function assertContains(source, values, label) {
  const missing = values.filter((value) => !source.includes(value));
  if (missing.length) {
    throw new Error(`${label} missing required media access guard markers: ${missing.join(", ")}`);
  }
}

assertContains(upload, requiredUpload, "upload route");
assertContains(object, requiredObject, "object route");
assertContains(status, requiredStatus, "status route");

if (/public-read|publicRead|acl/i.test(upload + object)) {
  throw new Error("Media routes must not enable public object access.");
}

console.log("Media access check passed: upload, retrieval, ownership, and timeline linkage are guarded.");
