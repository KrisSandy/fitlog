import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "FitLog — Workout Tracker",
  description: "Personal workout tracker with AI coaching",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
