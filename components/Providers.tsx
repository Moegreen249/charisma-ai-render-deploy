"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { EnhancedLanguageProvider } from "@/components/EnhancedLanguageProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <EnhancedLanguageProvider>
        {children}
      </EnhancedLanguageProvider>
    </SessionProvider>
  );
} 