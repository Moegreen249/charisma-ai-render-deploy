'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Github } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

const publicFooterLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Use Cases', href: '/#use-cases' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const authenticatedFooterLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Use Cases', href: '/#use-cases' },
    { label: 'Analyze', href: '/analyze' },
    { label: 'History', href: '/history' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Status', href: '/status' },
  ],
  support: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export function UnifiedFooter() {
  const { data: session } = useSession();
  const currentYear = new Date().getFullYear();
  
  // Use different footer links based on authentication status
  const footerLinks = session ? authenticatedFooterLinks : publicFooterLinks;

  return (
    <footer className="relative mt-auto">
      {/* Gradient Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      {/* Main Footer */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-t border-white/5">
        <div className={cn('mx-auto py-12', themeConfig.layout.maxWidth, themeConfig.layout.containerPadding)}>
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <h3 className={cn('text-2xl font-bold', themeConfig.typography.gradient)}>
                  CharismaAI
                </h3>
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered communication analysis platform helping you understand conversations better
                with advanced insights and analytics.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:col-span-3 gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="text-white font-semibold mb-4 capitalize">{category}</h4>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>



          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} CharismaAI. All rights reserved. Developed by Mohamed Abdelrazig - MAAM
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
      </div>
    </footer>
  );
}