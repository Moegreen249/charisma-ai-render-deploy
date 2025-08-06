'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  googleAnalyticsId?: string;
  vercelAnalytics?: boolean;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function AnalyticsProvider({ 
  children, 
  googleAnalyticsId, 
  vercelAnalytics = true 
}: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize dataLayer for Google Analytics
    if (googleAnalyticsId && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [googleAnalyticsId]);

  return (
    <>
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}

      {/* Vercel Analytics */}
      {vercelAnalytics && (
        <Script
          src="https://va.vercel-scripts.com/v1/script.js"
          strategy="afterInteractive"
          data-project-id={process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID}
        />
      )}

      {children}
    </>
  );
}

// Hook for tracking events
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    // Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', eventName, parameters);
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, parameters);
    }
  };

  const trackPageView = (url: string, title?: string) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title || document.title,
        page_location: url,
      });
    }

    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('pageview', { path: url });
    }
  };

  return { trackEvent, trackPageView };
}