import { Metadata } from 'next';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Cookie, Shield, Settings, Eye, Clock, Info } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Cookie Policy - CharismaAI',
  description: 'Learn about how CharismaAI uses cookies and similar technologies to improve your experience and protect your privacy.',
};

const cookieTypes = [
  {
    icon: Shield,
    title: 'Essential Cookies',
    description: 'Required for basic website functionality and security',
    examples: [
      'Authentication tokens',
      'Session management',
      'Security preferences',
      'CSRF protection',
    ],
    retention: 'Session or 30 days',
    canDisable: false,
  },
  {
    icon: Settings,
    title: 'Functional Cookies',
    description: 'Remember your preferences and settings',
    examples: [
      'Language preferences',
      'Theme settings',
      'Analysis templates',
      'Dashboard layout',
    ],
    retention: '1 year',
    canDisable: true,
  },
  {
    icon: BarChart3,
    title: 'Analytics Cookies',
    description: 'Help us understand how you use our service',
    examples: [
      'Page views and interactions',
      'Feature usage statistics',
      'Performance metrics',
      'Error tracking',
    ],
    retention: '2 years',
    canDisable: true,
  },
];

export default function CookiePolicyPage() {
  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Cookie className="w-4 h-4 mr-2" />
            Cookie Policy
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            This Cookie Policy explains how CharismaAI uses cookies and similar technologies to provide, 
            improve, and protect our services.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            Last updated: January 15, 2024
          </div>
        </div>

        {/* What Are Cookies */}
        <div className="mb-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-purple-400" />
                <CardTitle className="text-white text-2xl">What Are Cookies?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                Cookies are small text files that are stored on your device when you visit a website. 
                They help websites remember information about your visit, making your next visit easier 
                and the site more useful to you.
              </p>
              <p>
                We use cookies and similar technologies (such as web beacons and pixels) to provide 
                our services, understand how you use them, and improve your experience.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Types of Cookies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Types of Cookies We Use</h2>
          <div className="space-y-6">
            {cookieTypes.map((cookieType, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                        <cookieType.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{cookieType.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {cookieType.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={cookieType.canDisable ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' : 'bg-red-500/20 text-red-200 border-red-400/30'}>
                      {cookieType.canDisable ? 'Optional' : 'Required'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Examples:</h4>
                      <ul className="space-y-1">
                        {cookieType.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-sm text-gray-400 flex items-center gap-2">
                            <div className="w-1 h-1 bg-purple-400 rounded-full" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Retention Period:</h4>
                      <p className="text-sm text-gray-400">{cookieType.retention}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Managing Your Cookie Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <CardTitle className="text-white">Browser Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300 text-sm">
                <p>You can control cookies through your browser settings:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <span>Block all cookies or only third-party cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <span>Delete existing cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <span>Set notifications when cookies are being sent</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-400" />
                  <CardTitle className="text-white">Privacy Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300 text-sm">
                <p>CharismaAI provides these privacy controls:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2" />
                    <span>Opt-out of analytics cookies in Settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2" />
                    <span>Clear your activity history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2" />
                    <span>Export or delete your data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Third-Party Services</h2>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 space-y-4 text-gray-300">
              <p>
                We use the following third-party services that may set their own cookies:
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Vercel Analytics</span>
                    <p className="text-sm text-gray-400">Performance and usage analytics</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">Optional</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">NextAuth.js</span>
                    <p className="text-sm text-gray-400">Authentication and session management</p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-200 border-red-400/30">Required</Badge>
                </div>
              </div>
              <p className="text-sm">
                Each service has its own privacy policy governing their use of cookies. 
                Please review their policies for more information.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Updates to Policy */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Changes to This Policy</h2>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 space-y-4 text-gray-300">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors.
              </p>
              <p>
                When we make changes, we will update the "Last updated" date at the top of this policy 
                and notify you through our service or by other appropriate means.
              </p>
              <p>
                We encourage you to review this policy periodically to stay informed about how we use cookies.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Questions About Cookies?</h3>
              <p className="text-gray-300 mb-6">
                If you have questions about our use of cookies or this policy, please contact us:
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Email: support@charismaai.com</p>
                <p>Subject: Cookie Policy Inquiry</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedLayout>
  );
}