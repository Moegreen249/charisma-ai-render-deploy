"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Sparkles,
  Brain,
  MessageSquare,
  Shield,
  Rocket,
  ArrowRight,
  Gift,
  Star,
} from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";

interface WelcomeCardProps {
  userName: string;
  onDismiss: () => void;
  onStartTour: () => void;
  className?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  onDismiss,
  onStartTour,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const welcomeSteps = [
    {
      title: `Welcome to CharismaAI, ${userName}! 🎉`,
      subtitle: "Your journey to AI-powered communication insights begins here",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <Logo size="lg" variant="gradient" showText={false} />
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You&apos;ve joined thousands of professionals who are transforming
              how they understand communication patterns, relationships, and
              team dynamics.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Welcome Gift
              </span>
            </div>
            <p className="text-sm text-purple-700">
              🎁 Free analysis credits • 📊 Premium templates • 🚀 Priority
              support
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Powerful AI Analysis at Your Fingertips",
      subtitle: "Discover what makes your communications effective",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-purple-800 mb-1">
                10 AI Templates
              </h4>
              <p className="text-xs text-purple-600">
                From emotional analysis to leadership insights
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-blue-800 mb-1">Multi-Format</h4>
              <p className="text-xs text-blue-600">
                WhatsApp, Slack, Discord, and more
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-green-800 mb-1">Rich Insights</h4>
              <p className="text-xs text-green-600">
                Interactive charts and detailed reports
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h4 className="font-medium text-orange-800 mb-1">100% Private</h4>
              <p className="text-xs text-orange-600">
                Your data stays secure and confidential
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Get Started?",
      subtitle: "Let's upload your first chat and see the magic happen",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 mb-4">
              Take a quick tour to see how easy it is to get incredible insights
              from your conversations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onStartTour}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Quick Tour
              </Button>
              <Button
                variant="outline"
                onClick={onDismiss}
                className="border-gray-300 hover:bg-gray-50"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const currentWelcomeStep = welcomeSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card
        className={cn(
          "relative w-full max-w-lg mx-auto bg-white border-0 shadow-2xl",
          "transform transition-all duration-300",
          isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100",
          className,
        )}
      >
        {/* Header */}
        <div className="relative p-6 pb-0">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="absolute top-4 right-4 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Step indicator */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 w-6"
                      : index < currentStep
                        ? "bg-green-400"
                        : "bg-gray-200",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Welcome badge */}
          <div className="text-center mb-4">
            <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
              <Star className="w-3 h-3 mr-1" />
              Welcome Aboard
            </Badge>
          </div>
        </div>

        <CardContent className="px-6 pb-6">
          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {currentWelcomeStep.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {currentWelcomeStep.subtitle}
            </p>
          </div>

          {/* Step content */}
          <div
            className={cn(
              "transition-all duration-300",
              isAnimating
                ? "opacity-0 transform translate-y-2"
                : "opacity-100 transform translate-y-0",
            )}
          >
            {currentWelcomeStep.content}
          </div>

          {/* Navigation */}
          {currentStep < welcomeSteps.length - 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-gray-500 hover:text-gray-700"
              >
                Previous
              </Button>

              <span className="text-xs text-gray-400">
                {currentStep + 1} of {welcomeSteps.length}
              </span>

              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>

        {/* Floating sparkles */}
        <div className="absolute -top-2 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-4 -right-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
      </Card>
    </div>
  );
};

export default WelcomeCard;
