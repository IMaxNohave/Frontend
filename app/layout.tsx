// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// ⬅️ import client component มาใช้เฉยๆ ได้
import ClientAuthBootstrap from "./_client-auth-bootstrap";

export const metadata: Metadata = {
  title: "Ro Trade",
  description: "Created with IMaxNohave",
  generator: "IMaxNohave",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      // { url: '/icon-dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' }, // สำหรับ Dark Mode
    ], // path ไปยังไฟล์ในโฟลเดอร์ public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* บูทสแตรป token ฝั่ง client */}
        <ClientAuthBootstrap />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
