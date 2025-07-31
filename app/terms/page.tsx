import { Metadata } from 'next';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Terms of Service - CharismaAI',
  description: 'Terms of Service for CharismaAI - AI-powered communication analysis platform',
};

export default function TermsOfServicePage() {
  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            "rounded-2xl p-8 border",
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow
          )}>
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Terms of Service
            </h1>
            
            <div className="prose prose-invert max-w-none">

              
              <p className="text-gray-300 mb-6">
                <em>Last Updated: January 2025</em>
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Agreement to Terms</h2>
                <p className="text-gray-300 mb-4">
                  By accessing or using CharismaAI (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">About CharismaAI</h2>
                <p className="text-gray-300 mb-4">
                  CharismaAI is an AI-powered communication analysis platform that provides insights into conversation patterns, emotional dynamics, and communication effectiveness.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Account Registration & Approval</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Eligibility</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li>You must be at least 13 years old to use the Service</li>
                  <li>You must have the legal capacity to enter into these Terms</li>
                  <li>You must not be prohibited from using the Service under applicable laws</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Account Registration</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must notify us of any unauthorized access</li>
                  <li>One account per person or organization</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Admin Approval Process</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Approval Required</strong>: All new accounts require admin approval before access is granted</li>
                  <li><strong>Review Process</strong>: We review applications to ensure platform quality and security</li>
                  <li><strong>Approval Timeline</strong>: Most applications are reviewed within 24-48 hours</li>
                  <li><strong>Rejection Rights</strong>: We reserve the right to reject applications without detailed explanation</li>
                  <li><strong>Reapplication</strong>: Rejected users may reapply after addressing any stated concerns</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Use of the Service</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Permitted Uses</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Personal Analysis</strong>: Analyze your own conversations for insights</li>
                  <li><strong>Professional Development</strong>: Use insights for communication improvement</li>
                  <li><strong>Research</strong>: Academic or professional research (with proper attribution)</li>
                  <li><strong>Team Analysis</strong>: Analyze team communications with proper consent</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Prohibited Uses</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
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
                <h2 className="text-2xl font-semibold text-white mb-4">Content and Data</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Your Content</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Ownership</strong>: You retain ownership of content you upload</li>
                  <li><strong>License</strong>: You grant us a limited license to process your content for analysis</li>
                  <li><strong>Responsibility</strong>: You are responsible for the legality of your content</li>
                  <li><strong>Consent</strong>: You must have proper consent for any conversations you analyze</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Our Content</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Analysis Results</strong>: Generated insights and reports belong to you</li>
                  <li><strong>Platform Content</strong>: Our software, algorithms, and documentation are protected</li>
                  <li><strong>Intellectual Property</strong>: All platform IP belongs to CharismaAI</li>
                  <li><strong>Templates</strong>: Our analysis templates are proprietary</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">AI and Analysis Accuracy</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">AI Limitations</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Not Perfect</strong>: AI analysis may contain errors or inaccuracies</li>
                  <li><strong>Interpretation</strong>: Results require human interpretation and judgment</li>
                  <li><strong>Context</strong>: AI may miss context or nuance in communications</li>
                  <li><strong>Bias</strong>: AI models may contain inherent biases</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Disclaimer</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>No Guarantees</strong>: We do not guarantee accuracy of analysis results</li>
                  <li><strong>Professional Advice</strong>: Results do not constitute professional advice</li>
                  <li><strong>Decision Making</strong>: Use results as one factor in decision-making</li>
                  <li><strong>Verification</strong>: Verify important insights through other means</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Account Termination</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Termination by User</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Voluntary</strong>: You may terminate your account at any time</li>
                  <li><strong>Data Retention</strong>: We may retain certain data as required by law</li>
                  <li><strong>Effect</strong>: Termination ends your right to use the Service</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Termination by Us</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Violations</strong>: We may terminate accounts for Terms violations</li>
                  <li><strong>Suspicious Activity</strong>: Accounts showing suspicious or harmful activity</li>
                  <li><strong>Inactive Accounts</strong>: Long-term inactive accounts may be terminated</li>
                  <li><strong>Notice</strong>: We will provide reasonable notice when possible</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Our Rights</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Platform</strong>: CharismaAI platform and all related IP</li>
                  <li><strong>Algorithms</strong>: Proprietary analysis algorithms and methods</li>
                  <li><strong>Templates</strong>: Analysis templates and frameworks</li>
                  <li><strong>Branding</strong>: CharismaAI name, logo, and branding materials</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Content</strong>: You retain rights to your uploaded content</li>
                  <li><strong>Results</strong>: Analysis results generated for your content</li>
                  <li><strong>Usage</strong>: Right to use the Service according to these Terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
                
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-3">Disclaimer of Warranties</h3>
                  <p className="text-yellow-200 text-sm">
                    THE SERVICE IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-xl font-semibold text-red-300 mb-3">Limitation of Damages</h3>
                  <p className="text-red-200 text-sm">
                    IN NO EVENT SHALL CHARISMAAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Updates</strong>: We may update these Terms from time to time</li>
                  <li><strong>Notice</strong>: Users will be notified of significant changes</li>
                  <li><strong>Continued Use</strong>: Continued use after changes constitutes acceptance</li>
                  <li><strong>Effective Date</strong>: Changes take effect on the date specified</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">General Inquiries</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Email</strong>: support@charisma-ai.com</li>
                  <li><strong>Developer</strong>: Mohamed Abdelrazig - MAAM</li>
                  <li><strong>Response Time</strong>: Within 48 hours</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Legal Notices</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Email</strong>: legal@charisma-ai.com</li>
                  <li><strong>Process</strong>: Formal legal notices and processes</li>
                </ul>
              </section>

              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-center text-gray-400">
                  <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
                </p>
                <p className="text-center text-gray-500 mt-2">
                  These Terms of Service are designed to protect both users and the platform while enabling innovative AI-powered communication analysis with proper admin oversight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}