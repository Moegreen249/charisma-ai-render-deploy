"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Mail,
  User,
  Building,
  Lightbulb,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WaitingListFormProps {
  className?: string;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  name: string;
  company: string;
  useCase: string;
  source: string;
}

const WaitingListForm: React.FC<WaitingListFormProps> = ({
  className,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    company: "",
    useCase: "",
    source: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);

  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear error when user starts typing
      if (error) setError(null);
    };

  const handleSelectChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!formData.name) {
      setError("Name is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waiting list");
      }

      setIsSuccess(true);
      setPosition(data.position);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 bg-white/5 backdrop-blur-xl",
          className,
        )}
      >
        {/* Success background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10"></div>

        <CardContent className="relative p-8 text-center">
          {/* Success animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            {/* Sparkle effects */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute top-4 right-1/4">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
            </div>
            <div className="absolute top-4 left-1/4">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
            Welcome to the Future! 🎉
          </h3>

          <p className="text-white/80 mb-6 leading-relaxed">
            You&apos;re officially on the CharismaAI waiting list! We&apos;ll
            notify you as soon as we launch.
          </p>

          {position && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-white/70">
                  Your Position
                </span>
              </div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                #{position}
              </div>
              <p className="text-xs text-white/60 mt-1">in the launch queue</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <Mail className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-white/60">Early Access</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-white/60">Exclusive Updates</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-white/60">Special Pricing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 bg-white/5 backdrop-blur-xl",
        className,
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-indigo-500/10"></div>

      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 animate-pulse"></div>

      <CardHeader className="relative pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-white/20"
          >
            Early Access
          </Badge>
        </div>

        <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
          Join the Waiting List
        </CardTitle>

        <CardDescription className="text-white/70 leading-relaxed">
          Be among the first to experience AI-powered communication insights.
          Get early access, exclusive updates, and special launch pricing.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange("email")}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/20"
              required
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange("name")}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/20"
              required
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company (Optional)
            </label>
            <Input
              type="text"
              placeholder="Your Company"
              value={formData.company}
              onChange={handleInputChange("company")}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/20"
            />
          </div>

          {/* Use Case */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Primary Use Case
            </label>
            <Select onValueChange={handleSelectChange("useCase")}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/20">
                <SelectValue placeholder="How will you use CharismaAI?" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="team-communication">
                  Team Communication Analysis
                </SelectItem>
                <SelectItem value="customer-service">
                  Customer Service Optimization
                </SelectItem>
                <SelectItem value="leadership-development">
                  Leadership Development
                </SelectItem>
                <SelectItem value="research">Academic/Research</SelectItem>
                <SelectItem value="personal">
                  Personal Communication Insights
                </SelectItem>
                <SelectItem value="coaching">Coaching & Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              How did you hear about us?
            </label>
            <Select onValueChange={handleSelectChange("source")}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/20">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="search-engine">Search Engine</SelectItem>
                <SelectItem value="word-of-mouth">Word of Mouth</SelectItem>
                <SelectItem value="blog-article">Blog/Article</SelectItem>
                <SelectItem value="conference">Conference/Event</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Tell us more about your needs (Optional)
            </label>
            <Textarea
              placeholder="What specific communication challenges are you hoping to solve?"
              value={formData.useCase}
              onChange={handleInputChange("useCase")}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400/20 min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Joining the list...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Secure My Spot
              </div>
            )}
          </Button>
        </form>

        {/* Benefits */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-white/60">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Early access to beta
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Exclusive launch pricing
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Priority support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitingListForm;
