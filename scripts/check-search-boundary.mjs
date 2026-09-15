import fs from "node:fs";

const searchPage = fs.readFileSync("app/search/page.tsx", "utf8");
const intent = fs.readFileSync("lib/search-intent.ts", "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(searchPage, 'parseLocalSearchIntent', "Search must use local deterministic intent parsing");
if (searchPage.includes('parseSearchIntent') || searchPage.includes('@/lib/ai-platform-core')) {
  throw new Error("Customer search must not require AI Platform Core");
}
requireText(searchPage, 'advancedSearchAllowed && terms.length', "Conversation/gift search must remain Pro-gated");
requireText(searchPage, 'Free search is intentionally profile-only', "Free search scope must stay explicit");
requireText(searchPage, 'この検索はAIを使わず、Velvet内で処理します。', "UI must explain deterministic phrase search");
requireText(intent, 'mode: "local" | "ai"', "Search intent contract unexpectedly changed");

console.log("Search boundary OK");
