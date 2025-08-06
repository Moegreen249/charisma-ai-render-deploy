'use client';

// Client component for help page
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { MessageSquare, Upload, Settings, Shield, Zap, BookOpen, Search, ChevronRight, Mail, Clock } from "lucide-react";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Metadata is handled by the parent layout for client components

const helpCategories = [
  {
    icon: Upload,
    title: 'Getting Started',
    description: 'Learn how to upload and analyze your first conversation',
    articles: [
      'How to export chat files from WhatsApp',
      'Supported file formats and chat platforms',
      'Understanding your first analysis results',
      'Setting up AI provider credentials',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Analysis Features',
    description: 'Understand the different types of analysis available',
    articles: [
      'Communication pattern analysis explained',
      'Relationship dynamics insights',
      'Emotional trend tracking',
      'Custom analysis templates',
    ],
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Manage your account, preferences, and configurations',
    articles: [
      'Configuring AI providers (Google, OpenAI, Anthropic)',
      'Managing your analysis history',
      'Privacy settings and data control',
      'Notification preferences',
    ],
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Learn about data protection and privacy features',
    articles: [
      'How your data is protected',
      'Data retention and deletion policies',
      'Using your own AI API keys',
      'GDPR compliance and your rights',
    ],
  },
];

const faqItems = [
  {
    question: 'How do I export chat files from WhatsApp?',
    answer: 'Open WhatsApp, go to the chat you want to analyze, tap the three dots menu, select "More", then "Export chat". Choose "Without Media" for faster processing.',
  },
  {
    question: 'Which AI providers do you support?',
    answer: 'CharismaAI supports Google Gemini, OpenAI GPT models, and Anthropic Claude. You can configure your preferred provider in Settings.',
  },
  {
    question: 'Is my conversation data secure?',
    answer: 'Yes, your data is encrypted in transit and at rest. We use your own AI provider credentials, so your conversations are processed securely without storing sensitive content.',
  },
  {
    question: 'How long does analysis take?',
    answer: 'Most analyses complete in under 30 seconds. Larger conversations (1000+ messages) may take up to 2 minutes.',
  },
  {
    question: 'Can I delete my analysis history?',
    answer: 'Yes, you can delete individual analyses or your entire history from your profile settings. Deleted data is permanently removed from our systems.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'CharismaAI is currently free to use. Any future pricing will include a fair refund policy for unsatisfied users.',
  },
];

const supportOptions = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get detailed help via email',
    contact: 'support@charismaai.com',
    responseTime: 'Usually within 24 hours',
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    description: 'Ask questions and share tips',
    contact: 'Coming Soon',
    responseTime: 'Community moderated',
  },
];

export default function HelpPage() {
  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Find answers to common questions, learn how to use CharismaAI effectively, or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{category.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                        <span className="text-gray-300 text-sm">{article}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((faq, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                <p className="text-gray-300 text-sm mb-4">Complete guides and API reference</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/docs">View Docs</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Quick Start</h3>
                <p className="text-gray-300 text-sm mb-4">Get started in just a few minutes</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/analyze">Start Analyzing</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Privacy Guide</h3>
                <p className="text-gray-300 text-sm mb-4">Learn about data protection</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed with CharismaAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {supportOptions.map((option, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6 text-center">
                  <option.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{option.description}</p>
                  <p className="text-purple-400 font-medium mb-2">{option.contact}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {option.responseTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}