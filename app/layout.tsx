import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { FeedbackHubLauncher } from "@/components/feedback-hub-launcher";
import "./globals.css";
import "./mobile-fixes.css";
import "./feedback.css";
import "./velvet-theme.css";
import "./capture-polish.css";
import "./customer-detail-polish.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Velvet",
  description: "大切な人との関係を忘れず、次の時間につなげるRelationship Managementアプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = <>{children}<FeedbackHubLauncher /></>;
  const clerkEnabled = process.env.VELVET_AUTH_MODE?.trim().toLowerCase() === "clerk";

  return (
    <html lang="ja">
      <body>{clerkEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  );
}
