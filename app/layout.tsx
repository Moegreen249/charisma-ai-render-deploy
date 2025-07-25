import type { Metadata } from "next";
import "./globals.css";
import "./rtl-globals.css";
import "@xyflow/react/dist/style.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "CharismaAI - AI-Powered Communication Analysis",
  description:
    "Analyze your chat conversations to discover insights about communication patterns, emotional dynamics, and personality traits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
