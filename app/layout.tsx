// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import ClientAuthBootstrap from "./_client-auth-bootstrap";
import AuthGuard from "./auth-guard"; // ⬅️ เพิ่ม

export const metadata: Metadata = {
  title: "Ro Trade",
  description: "Created with IMaxNohave",
  generator: "IMaxNohave",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* บูท token เข้าสู่ Zustand */}
        <ClientAuthBootstrap />
        {/* ดัก route private + sync หลายแท็บ */}
        <AuthGuard />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
