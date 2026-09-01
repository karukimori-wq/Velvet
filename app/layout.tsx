import type { Metadata } from "next";
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
  return (
    <html lang="ja">
      <body>{children}<FeedbackHubLauncher /></body>
    </html>
  );
}
