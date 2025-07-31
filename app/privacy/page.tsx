import { Metadata } from 'next';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Privacy Policy - CharismaAI',
  description: 'Privacy Policy for CharismaAI - AI-powered communication analysis platform',
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-6">
                <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
              </p>
              
              <p className="text-gray-300 mb-6">
                <em>Last Updated: January 2025</em>
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
                <p className="text-gray-300 mb-4">
                  CharismaAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered communication analysis platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Account Information</strong>: Name, email address, profile picture</li>
                  <li><strong>Authentication Data</strong>: Login credentials, OAuth tokens</li>
                  <li><strong>Profile Data</strong>: User preferences, settings, and configurations</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Conversation Data</strong>: Text content you upload for analysis (temporarily processed)</li>
                  <li><strong>Analysis Results</strong>: Generated insights and reports</li>
                  <li><strong>Usage Analytics</strong>: Feature usage, session duration, interaction patterns</li>
                  <li><strong>Technical Data</strong>: IP address, browser type, device information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Primary Uses</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Service Delivery</strong>: Provide AI-powered conversation analysis</li>
                  <li><strong>Account Management</strong>: Maintain your account and preferences</li>
                  <li><strong>Communication</strong>: Send service updates and support responses</li>
                  <li><strong>Improvement</strong>: Enhance our AI models and platform features</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">AI Processing</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Temporary Processing</strong>: Conversation data is processed temporarily for analysis</li>
                  <li><strong>No Permanent Storage</strong>: Original conversation content is not permanently stored</li>
                  <li><strong>Model Training</strong>: We do not use your data to train AI models without explicit consent</li>
                  <li><strong>Analysis Results</strong>: Generated insights are stored for your access</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Data Protection and Security</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Security Measures</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Encryption</strong>: All data transmitted using SSL/TLS encryption</li>
                  <li><strong>Access Control</strong>: Role-based access with authentication</li>
                  <li><strong>Data Minimization</strong>: We collect only necessary information</li>
                  <li><strong>Regular Audits</strong>: Security assessments and vulnerability testing</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Data Retention</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Account Data</strong>: Retained while your account is active</li>
                  <li><strong>Analysis Results</strong>: Stored for your access and historical reference</li>
                  <li><strong>Conversation Content</strong>: Processed temporarily, not permanently stored</li>
                  <li><strong>Logs</strong>: Retained for 90 days for security and debugging purposes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">AI Providers</h3>
                <p className="text-gray-300 mb-4">
                  We use third-party AI services for analysis:
                </p>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Google AI/Gemini</strong>: For natural language processing</li>
                  <li><strong>OpenAI</strong>: For advanced analysis capabilities</li>
                  <li><strong>Anthropic</strong>: For specialized analysis tasks</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  <strong>Data Handling</strong>: These services process your data according to their privacy policies. We ensure all providers meet enterprise security standards.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Your Rights and Choices</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Access and Control</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Account Access</strong>: View and update your account information</li>
                  <li><strong>Data Export</strong>: Request a copy of your data</li>
                  <li><strong>Data Deletion</strong>: Request deletion of your account and data</li>
                  <li><strong>Analysis History</strong>: View, download, or delete your analysis results</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-3">Privacy Controls</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Data Processing</strong>: Control how your data is processed</li>
                  <li><strong>Communication Preferences</strong>: Manage email notifications</li>
                  <li><strong>Account Deletion</strong>: Permanently delete your account and associated data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Privacy Questions</h3>
                <p className="text-gray-300 mb-4">
                  For privacy-related questions or concerns:
                </p>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>Email</strong>: privacy@charisma-ai.com</li>
                  <li><strong>Developer</strong>: Mohamed Abdelrazig - MAAM</li>
                  <li><strong>Response Time</strong>: Within 48 hours</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Compliance</h2>
                
                <h3 className="text-xl font-semibold text-white mb-3">Regulatory Compliance</h3>
                <ul className="text-gray-300 mb-4 list-disc list-inside">
                  <li><strong>GDPR</strong>: European Union General Data Protection Regulation</li>
                  <li><strong>CCPA</strong>: California Consumer Privacy Act</li>
                  <li><strong>SOC 2</strong>: Security and availability standards</li>
                  <li><strong>Industry Standards</strong>: Following best practices for data protection</li>
                </ul>
              </section>

              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-center text-gray-400">
                  <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
                </p>
                <p className="text-center text-gray-500 mt-2">
                  This Privacy Policy is designed to be transparent and comprehensive. We are committed to protecting your privacy while providing excellent AI-powered communication analysis services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}