import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaWealth — Household Finance & Investing",
  description: "Track income, spending, and investing. Project savings against inflation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
