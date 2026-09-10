import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { FeedbackHubLauncher } from "@/components/feedback-hub-launcher";
import "./globals.css";
import "./mobile-fixes.css";
import "./feedback.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Velvet",
  description: "夜職専用営業アシスタント",
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
