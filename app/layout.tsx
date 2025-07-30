import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "./rtl-globals.css";
import "@xyflow/react/dist/style.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { prisma } from "@/lib/prisma";

// Configure fonts
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

// For Arabic font, we'll use Google Fonts via CSS import since Tajawal might not be available in next/font/google
// We'll add it via CSS import in globals.css

// Get SEO settings from database
async function getSeoSettings() {
  try {
    const settings = await prisma.seoSettings.findFirst();
    return settings;
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  
  return {
    title: seoSettings?.siteName || "CharismaAI - AI-Powered Communication Analysis",
    description: seoSettings?.siteDescription || "Analyze your chat conversations to discover insights about communication patterns, emotional dynamics, and personality traits.",
    keywords: seoSettings?.siteKeywords || "AI, communication, analysis, conversation, insights",
    authors: [{ name: "Mohamed Abdelrazig - MAAM" }],
    creator: "Mohamed Abdelrazig - MAAM",
    publisher: "CharismaAI",
    metadataBase: new URL(seoSettings?.siteUrl || 'https://charismaai.vercel.app'),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: seoSettings?.siteUrl || 'https://charismaai.vercel.app',
      siteName: seoSettings?.siteName || 'CharismaAI',
      title: seoSettings?.siteName || 'CharismaAI - AI-Powered Communication Analysis',
      description: seoSettings?.siteDescription || 'AI-powered communication analysis platform',
      images: seoSettings?.ogImage ? [{ url: seoSettings.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: seoSettings?.twitterHandle || '@CharismaAI',
      creator: seoSettings?.twitterHandle || '@CharismaAI',
      title: seoSettings?.siteName || 'CharismaAI',
      description: seoSettings?.siteDescription || 'AI-powered communication analysis platform',
      images: seoSettings?.ogImage ? [seoSettings.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoSettings = await getSeoSettings();
  
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
      </head>
      <body className={`${roboto.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AnalyticsProvider
          googleAnalyticsId={seoSettings?.googleAnalyticsId || undefined}
          vercelAnalytics={seoSettings?.vercelAnalytics ?? true}
        >
          <Providers>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
