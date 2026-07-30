import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderIQ",
  description: "AI Procurement Intelligence Platform for MSMEs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
