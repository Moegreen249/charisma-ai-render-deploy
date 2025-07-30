"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { EnhancedLanguageProvider } from "@/components/EnhancedLanguageProvider";
// import {
//   NotificationProvider,
//   useRealTimeNotifications,
// } from "@/components/notifications/NotificationProvider";

interface ProvidersProps {
  children: ReactNode;
}

// function NotificationSetup() {
//   useRealTimeNotifications();
//   return null;
// }

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <EnhancedLanguageProvider>{children}</EnhancedLanguageProvider>
    </SessionProvider>
  );
}
