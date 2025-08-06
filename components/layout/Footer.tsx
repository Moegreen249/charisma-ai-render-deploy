'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import Logo from '@/components/ui/logo';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo size="md" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              AI-powered communication analysis platform that provides insights into conversation patterns, 
              emotional dynamics, and communication effectiveness.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                AI-Powered Analysis
              </li>
              <li className="text-sm text-muted-foreground">
                Communication Insights
              </li>
              <li className="text-sm text-muted-foreground">
                Multi-Language Support
              </li>
              <li className="text-sm text-muted-foreground">
                Professional Templates
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CharismaAI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
              Developed with ❤️ by Mohamed Abdelrazig - MAAM
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}