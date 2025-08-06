"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "@/components/countdown-timer";
import WaitingListForm from "@/components/waiting-list-form";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";

import Logo from "@/components/ui/logo";
import EnhancedDataBackground from "@/components/ui/EnhancedDataBackground";
import { Brain, MessageSquare, Shield, Zap, Users, TrendingUp, Sparkles, ArrowRight, Rocket,  } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { cn } from "@/lib/utils";

interface LaunchData {
  targetDate: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  completedTitle: string;
  completedSubtitle: string;
}

export default function HomePage() {
  const { status } = useSession();
  const [launchData, setLaunchData] = useState<LaunchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWaitingList, setShowWaitingList] = useState(true);

  // Optional: Redirect authenticated users to analyze page (disabled to allow home page access)
  // useEffect(() => {
  //   if (status === "authenticated") {
  //     window.location.href = "/analyze";
  //   }
  // }, [status]);

  // Fetch launch countdown data
  useEffect(() => {
    const fetchLaunchData = async () => {
      try {
        const response = await fetch("/api/launch-countdown");
        if (response.ok) {
          const data = await response.json();
          setLaunchData(data);
        }
      } catch (error) {
        console.error("Failed to fetch launch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaunchData();
  }, []);

  const handleCountdownComplete = () => {
    setShowWaitingList(false);
  };

  const features = [
    {
      icon: Brain,
      title: "Deep Conversation Analysis",
      description:
        "Uncover hidden patterns in your conversations. Analyze sentiment, detect key topics, and understand communication styles across all your chats.",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      icon: MessageSquare,
      title: "Universal Chat Support",
      description:
        "Works with WhatsApp, Telegram, Discord, Slack, and more. Simply export your chats and upload them for instant analysis.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Stunning Visual Reports",
      description:
        "Transform raw conversations into beautiful charts, timelines, and insights. See your communication patterns come to life.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Privacy-First Design",
      description:
        "Your conversations never leave your control. All processing happens securely with your own AI provider credentials.",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast Results",
      description:
        "Get comprehensive analysis in under 30 seconds. Our optimized AI pipeline processes thousands of messages instantly.",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: Users,
      title: "Relationship Insights",
      description:
        "Understand the dynamics between participants. Track relationship evolution, communication frequency, and emotional patterns.",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  const useCases = [
    {
      title: "Personal Relationships",
      description:
        "Understand your communication patterns with friends and family",
      icon: Users,
      stats: "Track emotional trends over time",
    },
    {
      title: "Team Collaboration",
      description: "Analyze workplace communication effectiveness",
      icon: MessageSquare,
      stats: "Identify collaboration bottlenecks",
    },
    {
      title: "Content Creation",
      description: "Analyze audience engagement and communication style",
      icon: TrendingUp,
      stats: "Optimize messaging strategy",
    },
  ];

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Logo size="xl" variant="white" />
          <div className="mt-4 w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show landing page to all users (authenticated and unauthenticated)
  // if (status === "authenticated") {
  //   return null; // Will redirect via useEffect
  // }

  // Landing page for all users
  return (
    <UnifiedLayout variant="default" showFooter={true}>
      <div className="text-white overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 -mt-12">
      {/* Enhanced Background with Data Flow Animation */}
      <EnhancedDataBackground />

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Conversation Analytics
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200">
              Decode Every
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Conversation
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              With AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your WhatsApp, Slack, and Discord conversations into
            actionable insights. Discover hidden patterns, emotional dynamics,
            and communication styles that drive better relationships.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                15+
              </div>
              <div className="text-sm text-white/70">Analysis Types</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                1M+
              </div>
              <div className="text-sm text-white/70">Messages Analyzed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                24/7
              </div>
              <div className="text-sm text-white/70">Processing</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-8 py-4 text-lg relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              onClick={() => (window.location.href = "/auth/signin")}
            >
              <span className="relative z-10 flex items-center">
                <Rocket className="w-5 h-5 mr-2" />
                Start Analyzing Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10"
              onClick={() => (window.location.href = "/auth/signin")}
            >
              <Brain className="w-5 h-5 mr-2" />
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      {launchData && launchData.isActive && showWaitingList && (
        <section className="relative z-10 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <CountdownTimer
              targetDate={new Date(launchData.targetDate)}
              title={launchData.title}
              subtitle={launchData.subtitle}
              completedTitle={launchData.completedTitle}
              completedSubtitle={launchData.completedSubtitle}
              onComplete={handleCountdownComplete}
            />
          </div>
        </section>
      )}

      {/* Waiting List Section */}
      {showWaitingList && (
        <section className="relative z-10 px-6 py-12">
          <div className="max-w-lg mx-auto">
            <WaitingListForm
              onSuccess={() => {
                // Handle successful signup
                console.log("Successfully joined waiting list");
              }}
            />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Powerful Features for
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Every Conversation
              </span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Advanced AI analysis tools that reveal the hidden stories in your
              conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-r",
                    feature.gradient,
                  )}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
              Perfect For Every Use Case
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              From personal relationships to professional teams, discover
              insights that matter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center hover:border-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-white">
                  {useCase.title}
                </h3>

                <p className="text-white/70 mb-4">{useCase.description}</p>

                <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {useCase.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Ready to Unlock Your
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Conversation Insights?
              </span>
            </h2>

            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Start analyzing your conversations today. Upload any chat export
              and discover patterns you never knew existed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-8 py-4 text-lg relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                onClick={() => (window.location.href = "/auth/signin")}
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      </div>
    </UnifiedLayout>
  );
}
