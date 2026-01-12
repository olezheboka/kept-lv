import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "solījums.lv - Politisko solījumu uzskaite",
    template: "%s | solījums.lv",
  },
  description: "Sekojiet līdzi politiķu solījumiem Latvijā. Pārskatāma platforma politiskās atbildības uzskaitei.",
  keywords: ["politika", "solījumi", "Latvija", "atbildība", "caurskatāmība"],
  authors: [{ name: "solījums.lv" }],
  openGraph: {
    type: "website",
    locale: "lv_LV",
    alternateLocale: ["en_US", "ru_RU"],
    siteName: "solījums.lv",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: "lv" }, { locale: "en" }, { locale: "ru" }];
}
