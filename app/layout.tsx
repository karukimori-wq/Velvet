import type { Metadata } from "next";
import "./globals.css";

// Velvet is an authenticated, owner-scoped application. User-facing pages must
// resolve request identity at runtime and must not be statically prerendered
// during `next build` with a demo/fixed identity.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Velvet",
  description: "夜職専用営業アシスタント",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
