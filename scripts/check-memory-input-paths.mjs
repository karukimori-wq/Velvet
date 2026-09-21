import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const stamp=read("components/capture-chat-input.tsx");
const organize=read("app/capture/organize/[captureId]/actions.ts");
const editor=read("components/remember-editor.tsx");
const editorApi=read("app/api/memory/editor/route.ts");
const memory=read("lib/customer-memory-repository.ts");
const policy=read("lib/memory-tag-policy.ts");
const checks=[
  [/addStamp\(/.test(stamp)&&/append\(`\$\{label\}：\$\{content\}`\)/.test(stamp),"stamp input must enter the shared chat payload"],
  [/memoryTag/.test(organize)&&/mergeMemoryTags/.test(organize)&&/upsertCustomerMemory/.test(organize),"chat/voice/AI candidates must converge on Professional Memory"],
  [editor.includes('fetch("/api/memory/editor"')&&editor.includes("body:JSON.stringify({customerId,tags})"),"field editor must save through the scoped memory editor API"],
  [/getRequestIdentity/.test(editorApi)&&/upsertCustomerMemory\(workspaceId, userId, customerId, \{ tags \}\)/.test(editorApi),"field input must persist to authenticated customerId-scoped Professional Memory"],
  [/customerId/.test(memory)&&/velvet_customer_memories/.test(memory),"Professional Memory must remain customerId scoped"],
  [/describeMemoryTagChanges/.test(policy)&&/accumulate/.test(policy)&&/replace/.test(policy),"repeat-visit memory policy must preserve add/change semantics"]
];
const failed=checks.filter(([ok])=>!ok);
if(failed.length){for(const [,message] of failed)console.error(`FAIL: ${message}`);process.exit(1)}
console.log("Memory input convergence check passed: stamp, text/voice, and field editor input share customerId-scoped Professional Memory.");
