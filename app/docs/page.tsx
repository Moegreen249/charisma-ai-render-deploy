import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, MessageSquare, Upload, Shield, Zap, Users, Settings, ArrowRight, ExternalLink, FileText, Lightbulb } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

export const metadata: Metadata = {
  title: 'Documentation - CharismaAI',
  description: 'Complete guide to using CharismaAI for AI-powered conversation analysis',
};

export default function DocumentationPage() {
  const quickStartSteps = [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Sign up and wait for admin approval to access the platform',
      icon: Users,
    },
    {
      step: 2,
      title: 'Export Your Conversations',
      description: 'Export chat files from WhatsApp, Telegram, Discord, or Slack',
      icon: MessageSquare,
    },
    {
      step: 3,
      title: 'Upload & Analyze',
      description: 'Upload your chat file and select an analysis template',
      icon: Upload,
    },
    {
      step: 4,
      title: 'View Insights',
      description: 'Explore detailed reports and visualizations of your conversations',
      icon: BarChart3,
    },
  ];

  const documentationSections = [
    {
      title: 'Getting Started',
      description: 'Everything you need to know to start using CharismaAI',
      icon: Lightbulb,
      color: 'from-green-500 to-emerald-600',
      articles: [
        { title: 'Account Setup & Approval Process', description: 'How to create an account and get approved' },
        { title: 'Supported Chat Platforms', description: 'WhatsApp, Telegram, Discord, Slack, and more' },
        { title: 'Exporting Your Conversations', description: 'Step-by-step guides for each platform' },
        { title: 'Your First Analysis', description: 'Complete walkthrough of the analysis process' },
      ]
    },
    {
      title: 'Analysis Features',
      description: 'Understanding the different types of analysis available',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-600',
      articles: [
        { title: 'Communication Patterns', description: 'Discover how you and others communicate' },
        { title: 'Emotional Analysis', description: 'Track emotional trends and sentiment over time' },
        { title: 'Relationship Dynamics', description: 'Understand interactions between participants' },
        { title: 'Topic Detection', description: 'Identify key themes and subjects in conversations' },
        { title: 'Custom Analysis Templates', description: 'Create personalized analysis frameworks' },
      ]
    },
    {
      title: 'Privacy & Security',
      description: 'How we protect your data and ensure privacy',
      icon: Shield,
      color: 'from-purple-500 to-indigo-600',
      articles: [
        { title: 'Data Processing & Storage', description: 'How your conversations are handled securely' },
        { title: 'AI Provider Integration', description: 'Using your own API keys for analysis' },
        { title: 'Privacy Controls', description: 'Managing your data and privacy settings' },
        { title: 'Data Deletion & Export', description: 'How to manage your data lifecycle' },
      ]
    },
    {
      title: 'Advanced Features',
      description: 'Power user features and customization options',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      articles: [
        { title: 'Multi-Language Support', description: 'Analyzing conversations in different languages' },
        { title: 'Batch Processing', description: 'Analyzing multiple conversations at once' },
        { title: 'API Integration', description: 'Integrating CharismaAI with your workflows' },
        { title: 'Team Collaboration', description: 'Sharing insights with team members' },
      ]
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and how to resolve them',
      icon: HelpCircle,
      color: 'from-yellow-500 to-orange-600',
      articles: [
        { title: 'Upload Issues', description: 'Fixing problems with file uploads' },
        { title: 'Analysis Errors', description: 'Understanding and resolving analysis failures' },
        { title: 'Account & Login Problems', description: 'Troubleshooting authentication issues' },
        { title: 'Performance Optimization', description: 'Getting the best results from your analysis' },
      ]
    },
    {
      title: 'Best Practices',
      description: 'Tips and recommendations for optimal results',
      icon: CheckCircle,
      color: 'from-pink-500 to-rose-600',
      articles: [
        { title: 'Preparing Your Data', description: 'How to clean and organize conversations' },
        { title: 'Choosing Analysis Types', description: 'Selecting the right analysis for your needs' },
        { title: 'Interpreting Results', description: 'Understanding and acting on insights' },
        { title: 'Ethical Considerations', description: 'Responsible use of conversation analysis' },
      ]
    },
  ];

  const faqs = [
    {
      question: 'Do I need to install any software?',
      answer: 'No, CharismaAI is a web-based platform. You only need a modern web browser to access all features.'
    },
    {
      question: 'What chat platforms are supported?',
      answer: 'We support WhatsApp, Telegram, Discord, Slack, and most other platforms that allow chat export.'
    },
    {
      question: 'Is my conversation data secure?',
      answer: 'Yes, we use your own AI provider credentials and implement enterprise-grade security measures to protect your data.'
    },
    {
      question: 'How long does analysis take?',
      answer: 'Most analyses complete within 30 seconds to 2 minutes, depending on conversation length and complexity.'
    },
    {
      question: 'Can I analyze conversations in different languages?',
      answer: 'Yes, CharismaAI supports multiple languages including English, Arabic, Spanish, French, and German.'
    },
    {
      question: 'Do I need approval to use the platform?',
      answer: 'Yes, all new accounts require admin approval to ensure platform quality and security. Most applications are reviewed within 24-48 hours.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 mb-6">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Documentation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Complete Guide to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                CharismaAI
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know to master AI-powered conversation analysis. 
              From getting started to advanced features and best practices.
            </p>
          </div>

          {/* Quick Start Guide */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Quick Start Guide
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStartSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Documentation Sections
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {documentationSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {section.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 text-sm">
                      {section.description}
                    </p>
                    
                    <div className="space-y-2">
                      {section.articles.map((article, articleIndex) => (
                        <div key={articleIndex} className="flex items-start space-x-2 text-sm">
                          <div className="w-4 h-4 rounded-full bg-purple-600/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          </div>
                          <div>
                            <div className="text-white font-medium">{article.title}</div>
                            <div className="text-gray-400 text-xs">{article.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Frequently Asked Questions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">
                Need More Help?
              </h2>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Support
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
                
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Get Started
                  <ExternalLink className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-gray-400 text-sm">
              This documentation is regularly updated to reflect the latest features and improvements.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}