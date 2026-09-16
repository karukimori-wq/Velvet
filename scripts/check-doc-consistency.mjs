import fs from "node:fs";

const files=["README.md","docs/current-product-contract.md","docs/development-roadmap.md","docs/ui-spec.md","docs/domain-model.md","docs/data-model.md","docs/database-schema.md","docs/persistence-setup.md","docs/billing-ai-points.md","docs/auth-permissions.md","docs/api-spec.md","docs/production-readiness.md","docs/product-principles.md","docs/coding-rules.md","docs/component-library.md","docs/design-system.md","docs/ai-capabilities.md"];
const text=files.map(file=>`${file}\n${fs.readFileSync(file,"utf8")}`).join("\n\n");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};

assert(text.includes("990 JPY/month")||text.includes("990 JPY / month"),"Current docs must preserve the Pro 990 JPY target");
assert(text.includes("rolling 3-month")||text.includes("rolling **3-month**")||text.includes("3-month visible history"),"Current docs must preserve Free 3-month history");
assert(text.includes("30 customers")||text.includes("30 managed customers"),"Current docs must preserve Free 30-customer limit");
assert(text.includes("Growth Engine")&&text.includes("Payment")&&text.includes("Sales"),"Current docs must preserve Growth Engine canonical business ownership");
assert(text.includes("AI Platform Core")&&text.includes("AI usage"),"Current docs must preserve AI Platform Core usage ownership");
assert(!text.includes("JPY 10,000/month target"),"Critical current docs must not restore the old JPY 10,000 Pro target");
assert(!text.includes("rolling one-year")&&!text.includes("rolling 1-year"),"Critical current docs must not restore the old one-year Free history rule");
assert(!text.includes("People: unlimited"),"Critical current docs must not restore unlimited Free customers");
assert(!text.includes("Export remains available on Free and Pro"),"Critical current docs must not restore Free export");
assert(!text.includes("### AmountPicker")&&!text.includes("### PointBalanceBadge"),"Current component docs must not restore Velvet-owned payment or unapproved AI-point components");

if(failures.length){console.error("Documentation consistency guard failed:\n- "+failures.join("\n- "));process.exit(1)}
console.log("Documentation consistency guard passed: critical docs match the current Free/Pro and ownership contract.");
