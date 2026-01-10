import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "KEPT - Politisko solījumu uzskaite",
    template: "%s | KEPT",
  },
  description: "Sekojiet līdzi politiķu solījumiem Latvijā. Pārskatāma platforma politiskās atbildības uzskaitei.",
  keywords: ["politika", "solījumi", "Latvija", "atbildība", "caurskatāmība"],
  authors: [{ name: "KEPT" }],
  openGraph: {
    type: "website",
    locale: "lv_LV",
    alternateLocale: ["en_US", "ru_RU"],
    siteName: "KEPT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export function generateStaticParams() {
  return [{ locale: "lv" }, { locale: "en" }, { locale: "ru" }];
}
