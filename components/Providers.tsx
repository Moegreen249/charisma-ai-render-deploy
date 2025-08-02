"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { EnhancedLanguageProvider } from "@/components/EnhancedLanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeInitializer } from "@/components/providers/ThemeInitializer";
import { PageErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { setupGlobalErrorHandling } from "@/lib/error-management";
// import {
//   NotificationProvider,
//   useRealTimeNotifications,
// } from "@/components/notifications/NotificationProvider";

interface ProvidersProps {
  children: ReactNode;
}

// Setup global error handling
function ErrorHandlingSetup() {
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);
  return null;
}

// function NotificationSetup() {
//   useRealTimeNotifications();
//   return null;
// }

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PageErrorBoundary componentName="App">
        <ThemeProvider>
          <ThemeInitializer />
          <EnhancedLanguageProvider>
            <ErrorHandlingSetup />
            {children}
          </EnhancedLanguageProvider>
        </ThemeProvider>
      </PageErrorBoundary>
    </SessionProvider>
  );
}
