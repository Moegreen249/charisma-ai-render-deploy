'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const TermsContent = () => (
  <div className="prose prose-gray dark:prose-invert max-w-none">
    <p className="text-muted-foreground mb-6">
      <em>Last Updated: January 2025</em>
    </p>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
      <p className="mb-4">
        By accessing or using CharismaAI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">About CharismaAI</h2>
      <p className="mb-4">
        CharismaAI is an AI-powered communication analysis platform that provides insights into conversation patterns, emotional dynamics, and communication effectiveness.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Account Registration & Approval</h2>
      
      <h3 className="text-xl font-semibold mb-3">Eligibility</h3>
      <ul className="mb-4 list-disc list-inside">
        <li>You must be at least 13 years old to use the Service</li>
        <li>You must have the legal capacity to enter into these Terms</li>
        <li>You must not be prohibited from using the Service under applicable laws</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Account Registration</h3>
      <ul className="mb-4 list-disc list-inside">
        <li>You must provide accurate and complete information</li>
        <li>You are responsible for maintaining account security</li>
        <li>You must notify us of any unauthorized access</li>
        <li>One account per person or organization</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Admin Approval Process</h3>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Approval Required</strong>: All new accounts require admin approval before access is granted</li>
        <li><strong>Review Process</strong>: We review applications to ensure platform quality and security</li>
        <li><strong>Approval Timeline</strong>: Most applications are reviewed within 24-48 hours</li>
        <li><strong>Rejection Rights</strong>: We reserve the right to reject applications without detailed explanation</li>
        <li><strong>Reapplication</strong>: Rejected users may reapply after addressing any stated concerns</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Use of the Service</h2>
      
      <h3 className="text-xl font-semibold mb-3">Permitted Uses</h3>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Personal Analysis</strong>: Analyze your own conversations for insights</li>
        <li><strong>Professional Development</strong>: Use insights for communication improvement</li>
        <li><strong>Research</strong>: Academic or professional research (with proper attribution)</li>
        <li><strong>Team Analysis</strong>: Analyze team communications with proper consent</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Prohibited Uses</h3>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Illegal Activities</strong>: Any unlawful or fraudulent activities</li>
        <li><strong>Privacy Violations</strong>: Analyzing conversations without proper consent</li>
        <li><strong>Harassment</strong>: Using the Service to harass or harm others</li>
        <li><strong>Spam</strong>: Sending unsolicited communications through the Service</li>
        <li><strong>Reverse Engineering</strong>: Attempting to reverse engineer our AI models</li>
        <li><strong>Data Mining</strong>: Unauthorized extraction of data or insights</li>
        <li><strong>Competitive Use</strong>: Using the Service to develop competing products</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
      
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Disclaimer of Warranties</h3>
        <p className="text-yellow-700 dark:text-yellow-200 text-sm">
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
      </div>

      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-lg p-4 mb-4">
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-3">Limitation of Damages</h3>
        <p className="text-red-700 dark:text-red-200 text-sm">
          IN NO EVENT SHALL CHARISMAAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE.
        </p>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
      
      <h3 className="text-xl font-semibold mb-3">General Inquiries</h3>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Email</strong>: support@charisma-ai.com</li>
        <li><strong>Response Time</strong>: Within 48 hours</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Legal Notices</h3>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Email</strong>: legal@charisma-ai.com</li>
        <li><strong>Process</strong>: Formal legal notices and processes</li>
      </ul>
    </section>

    <div className="mt-12 pt-8 border-t border-border text-center">
      <p className="text-muted-foreground">
        <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
      </p>
    </div>
  </div>
);

const PrivacyContent = () => (
  <div className="prose prose-gray dark:prose-invert max-w-none">
    <p className="text-muted-foreground mb-6">
      <em>Last Updated: January 2025</em>
    </p>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
      <p className="mb-4">
        We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
      </p>
      
      <h3 className="text-xl font-semibold mb-3">Account Information</h3>
      <ul className="mb-4 list-disc list-inside">
        <li>Name and email address</li>
        <li>Password (encrypted)</li>
        <li>Profile preferences</li>
        <li>Language settings</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
      <ul className="mb-4 list-disc list-inside">
        <li>Conversation data you upload for analysis</li>
        <li>Analysis results and insights</li>
        <li>Usage patterns and preferences</li>
        <li>Technical logs and performance data</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Service Provision</strong>: To provide and improve our AI analysis services</li>
        <li><strong>Communication</strong>: To send you updates, support responses, and important notices</li>
        <li><strong>Security</strong>: To protect against fraud and ensure platform security</li>
        <li><strong>Analytics</strong>: To understand usage patterns and improve our services</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
      <p className="mb-4">
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
      </p>
      
      <h3 className="text-xl font-semibold mb-3">Security Measures</h3>
      <ul className="mb-4 list-disc list-inside">
        <li>Encryption of data in transit and at rest</li>
        <li>Regular security audits and updates</li>
        <li>Access controls and authentication</li>
        <li>Secure data processing environments</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Access</strong>: Request access to your personal information</li>
        <li><strong>Correction</strong>: Request correction of inaccurate information</li>
        <li><strong>Deletion</strong>: Request deletion of your personal information</li>
        <li><strong>Portability</strong>: Request export of your data</li>
        <li><strong>Objection</strong>: Object to certain processing activities</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at:
      </p>
      <ul className="mb-4 list-disc list-inside">
        <li><strong>Email</strong>: privacy@charisma-ai.com</li>
        <li><strong>Support</strong>: support@charisma-ai.com</li>
      </ul>
    </section>

    <div className="mt-12 pt-8 border-t border-border text-center">
      <p className="text-muted-foreground">
        <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
      </p>
    </div>
  </div>
);

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}