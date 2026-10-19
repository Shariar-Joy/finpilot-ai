import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "FinPilot AI — Your money, understood.",
  description:
    "An explainable personal finance assistant. Synthetic sandbox demonstration.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
