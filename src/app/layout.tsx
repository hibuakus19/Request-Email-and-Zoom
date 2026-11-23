import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ticketing — Portal Layanan TI",
    template: "%s · Ticketing",
  },
  description:
    "Portal internal untuk mengajukan pembuatan email, reset password, dan pemesanan ruang Zoom.",
};

export const viewport: Viewport = {
  themeColor: "#1f4e79",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
