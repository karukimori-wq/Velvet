import type { Metadata } from "next";
import "./globals.css";

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
