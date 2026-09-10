import fs from "node:fs";

const identity = fs.readFileSync("lib/auth/request-identity.ts", "utf8");
const proxy = fs.readFileSync("proxy.ts", "utf8");
const authPage = fs.readFileSync("app/auth/page.tsx", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const settings = fs.readFileSync("app/settings/page.tsx", "utf8");

const checks = [
  [identity.includes('source: "clerk"') && identity.includes("await auth()"), "Clerk identity must be resolved server-side"],
  [identity.includes("workspace_${userId}"), "Clerk identity must map to a stable owner workspace"],
  [proxy.includes('pathname === "/auth"') && proxy.includes("AUTH_REQUIRED"), "Auth screen must stay public while protected APIs reject signed-out requests"],
  [layout.includes("<ClerkProvider>"), "ClerkProvider must be available in Clerk mode"],
  [authPage.includes("無料で登録") && authPage.includes("登録済みの方はこちら（ログイン）"), "Public auth UX must use Velvet-facing Japanese copy"],
  [authPage.includes("8文字以上") && authPage.includes("/[A-Za-z]/") && authPage.includes("/[0-9]/"), "Velvet password UI must enforce the approved 8+ letter/number rule"],
  [authPage.includes('id="clerk-captcha"'), "Custom sign-up flow must keep the bot-protection mount point"],
  [settings.includes("ログアウト") && settings.includes('redirectUrl="/auth"'), "Clerk mode must provide a logout path back to Velvet auth"],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error(`FAIL: ${message}`);
  process.exit(1);
}
console.log(`Auth boundary checks passed (${checks.length})`);
