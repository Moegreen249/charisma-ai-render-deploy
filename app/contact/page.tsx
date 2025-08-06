import { Metadata } from 'next';
import { Mail, Scale, Code, Rocket, Wrench, Lightbulb, Handshake, BookOpen, Search, FileText, Camera } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";

export const metadata: Metadata = {
  title: 'Contact Us - CharismaAI',
  description: 'Get in touch with the CharismaAI team for support, questions, or feedback',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              Contact Us
            </h1>
            
            <div className="prose prose-invert max-w-none">


              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
                    <p className="text-gray-300 mb-6">
                      We'd love to hear from you! Whether you have questions, feedback, or need support, 
                      we're here to help you get the most out of CharismaAI.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Email Support</p>
                          <p className="text-gray-300">support@charisma-ai.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Scale className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Legal & Business</p>
                          <p className="text-gray-300">legal@charisma-ai.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Code className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Development Team</p>
                          <p className="text-gray-300">dev@charisma-ai.com</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3">Response Times</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li><strong>General Support:</strong> Within 24-48 hours</li>
                      <li><strong>Technical Issues:</strong> Within 12-24 hours</li>
                      <li><strong>Business Inquiries:</strong> Within 2-3 business days</li>
                      <li><strong>Legal Matters:</strong> Within 3-5 business days</li>
                    </ul>
                  </section>
                </div>

                {/* Support Categories */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">How We Can Help</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Rocket className="h-4 w-4 text-purple-400" />
                          <h4 className="text-white font-semibold">Getting Started</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Need help setting up your account or understanding how CharismaAI works? 
                          We'll guide you through the basics.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Wrench className="h-4 w-4 text-blue-400" />
                          <h4 className="text-white font-semibold">Technical Support</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Experiencing bugs, errors, or technical difficulties? 
                          Our team will help resolve any issues quickly.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-400" />
                          <h4 className="text-white font-semibold">Feature Requests</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Have ideas for new features or improvements? 
                          We love hearing from our users about how to make CharismaAI better.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <Handshake className="h-4 w-4 text-green-400" />
                          <h4 className="text-white font-semibold">Partnerships</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Interested in partnering with us or integrating CharismaAI into your platform? 
                          Let's discuss opportunities.
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-orange-400" />
                          <h4 className="text-white font-semibold">Enterprise Solutions</h4>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Looking for custom solutions for your organization? 
                          We offer tailored packages for teams and enterprises.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Before You Contact Us</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Check our documentation</h4>
                          <p className="text-gray-300 text-sm">Many common questions are answered in our user guides</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Search className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Search existing issues</h4>
                          <p className="text-gray-300 text-sm">Your question might already be addressed</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Be specific</h4>
                          <p className="text-gray-300 text-sm">Include details about your issue, browser, and steps to reproduce</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Include screenshots</h4>
                          <p className="text-gray-300 text-sm">Visual information helps us understand your issue faster</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-center text-gray-400">
                  <strong>Developed by Mohamed Abdelrazig - MAAM</strong>
                </p>
                <p className="text-center text-gray-500 mt-2">
                  We're committed to providing excellent support and continuously improving CharismaAI based on your feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}