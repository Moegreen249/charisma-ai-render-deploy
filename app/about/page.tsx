import { Metadata } from 'next';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { 
  Brain, 
  Heart, 
  Users, 
  Target, 
  Lightbulb,
  Award,
  Globe,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'About CharismaAI - AI-Powered Communication Analysis',
  description: 'Learn about CharismaAI mission to transform communication analysis through artificial intelligence. Discover our story, values, and team.',
};

const values = [
  {
    icon: Brain,
    title: 'AI-First Innovation',
    description: 'We leverage cutting-edge artificial intelligence to unlock insights hidden in everyday conversations.',
  },
  {
    icon: Heart,  
    title: 'Privacy by Design',
    description: 'Your conversations are yours. We prioritize data privacy and give you full control over your information.',
  },
  {
    icon: Users,
    title: 'Human Connection',
    description: 'Technology should enhance human relationships, not replace them. We build tools that bring people closer.',
  },
  {
    icon: Target,
    title: 'Actionable Insights',
    description: 'We don\'t just analyze data - we provide clear, actionable insights that help improve communication.',
  },
];

const achievements = [
  { icon: Users, label: 'Active Users', value: '10K+' },
  { icon: Brain, label: 'Conversations Analyzed', value: '1M+' },
  { icon: Globe, label: 'Languages Supported', value: '25+' },
  { icon: Zap, label: 'Analysis Speed', value: '<30s' },
];

export default function AboutPage() {
  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Lightbulb className="w-4 h-4 mr-2" />
            About CharismaAI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Transforming Communication
            <br />
            Through AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            CharismaAI was born from a simple belief: every conversation contains valuable insights waiting to be discovered. 
            We combine advanced AI with intuitive design to help you understand communication like never before.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-20">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
              <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                To democratize communication analysis by making sophisticated AI tools accessible to everyone. 
                Whether you're improving personal relationships, enhancing team collaboration, or conducting research, 
                CharismaAI provides the insights you need to communicate more effectively.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Our Values</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              These core principles guide everything we do, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                      <p className="text-gray-300">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">By the Numbers</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our impact in transforming how people understand and improve their communication.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
                <CardContent className="p-6">
                  <achievement.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{achievement.value}</div>
                  <div className="text-sm text-gray-300">{achievement.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Meet the Creator</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              CharismaAI is developed and maintained by Mohamed Abdelrazig - MAAM, a passionate developer 
              dedicated to creating innovative AI solutions.
            </p>
          </div>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">MA</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mohamed Abdelrazig - MAAM</h3>
              <p className="text-purple-400 mb-4">Founder & Lead Developer</p>
              <p className="text-gray-300 leading-relaxed">
                With a passion for AI and human communication, Mohamed brings together technical expertise 
                and user-centered design to create tools that truly make a difference in how we understand 
                and improve our conversations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Powered by Advanced Technology</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              CharismaAI leverages the latest developments in artificial intelligence, natural language processing, 
              and cloud computing to deliver fast, accurate, and insightful analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Multi-Provider AI</h3>
                <p className="text-gray-300">
                  Support for Google Gemini, OpenAI GPT, and Anthropic Claude for diverse analysis perspectives.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Optimized processing pipeline delivers comprehensive analysis in under 30 seconds.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Production Ready</h3>
                <p className="text-gray-300">
                  Enterprise-grade infrastructure with 99.9% uptime and comprehensive monitoring.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}