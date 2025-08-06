import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "./rtl-globals.css";
import "@xyflow/react/dist/style.css";
import Providers from "@/components/Providers";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { prisma } from "@/lib/prisma";
import '@/lib/init-charisma'; // Initialize CharismaAI self-reflection system

// Configure Roboto font with optimizations
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
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
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/charisma-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme and Performance */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="color-scheme" content="dark" />
        
        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//vercel.live" />
        <link rel="dns-prefetch" href="//vitals.vercel-insights.com" />
        
        {/* Viewport and Mobile Optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${roboto.variable} antialiased min-h-screen`}>
        <AnalyticsProvider
          googleAnalyticsId={seoSettings?.googleAnalyticsId || undefined}
          vercelAnalytics={seoSettings?.vercelAnalytics ?? true}
        >
          <Providers>
            {children}
          </Providers>
        </AnalyticsProvider>
        <Analytics />
        <SpeedInsights />
        
        {/* Performance Monitor - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
            <div>Performance Monitor Active</div>
            <div>Check console for metrics</div>
          </div>
        )}
      </body>
    </html>
  );
}
