import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
// import { notFound } from "next/navigation";
// import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

import { getLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
// import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata" });

  // Fetch dynamic config
  const config: Record<string, string> = {};
  /* 
  try {
    const dbConfigs = await prisma.systemConfig.findMany();
    config = dbConfigs.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error("Failed to fetch system config for metadata", error);
  }
  */

  const title = config.title || t("title");
  const description = config.description || t("description");
  const siteName = config.siteName || t("siteName");

  const defaultKeywords = [
    "solījumi", "politiķi", "partijas", "Saeima", "valdība",
    "Latvija", "vēlēšanas", "izpilde", "monitorings",
    "atbildība", "caurspīdīgums", "demokrātija"
  ];

  const keywords = config.keywords
    ? config.keywords.split(",").map(k => k.trim())
    : defaultKeywords;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      siteName,
      locale: locale,
      type: "website",
      images: config.ogImageUrl ? [{ url: config.ogImageUrl }] : undefined,
    },
    twitter: config.twitterHandle ? {
      card: "summary_large_image",
      site: config.twitterHandle,
      creator: config.twitterHandle,
    } : undefined,
    verification: config.googleVerificationId ? {
      google: config.googleVerificationId,
    } : undefined,
    icons: {
      icon: config.faviconUrl || "/favicon.ico",
    },
    other: {
      "application-name": siteName,
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "solījums.lv",
              "url": "https://solijums.lv",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://solijums.lv/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster />
            <Sonner position="top-center" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
