"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Mail, Shield } from "lucide-react";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Home from "lucide-react/dist/esm/icons/home";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return {
          title: "Invalid Credentials",
          message: "The email or password you entered is incorrect. Please double-check your credentials and try again.",
          icon: Shield,
          suggestions: [
            "Verify your email address is correct",
            "Check if Caps Lock is on",
            "Try resetting your password if you've forgotten it"
          ]
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "Your account doesn't have permission to access this resource. Please contact an administrator.",
          icon: XCircle,
          suggestions: [
            "Contact your administrator for access",
            "Check if your account is approved",
            "Verify you're using the correct account"
          ]
        };
      case "Verification":
        return {
          title: "Email Verification Failed",
          message: "We couldn't verify your email address. Please check your inbox and try again.",
          icon: Mail,
          suggestions: [
            "Check your spam/junk folder",
            "Request a new verification email",
            "Ensure your email address is correct"
          ]
        };
      case "Configuration":
        return {
          title: "Authentication Configuration Error",
          message: "There's a system configuration issue. Our team has been notified. Please try again later.",
          icon: AlertCircle,
          suggestions: [
            "Try again in a few minutes",
            "Contact support if the issue persists",
            "Check our status page for updates"
          ]
        };
      case "Default":
      default:
        return {
          title: "Authentication Error",
          message: "An unexpected error occurred during authentication. Please try again or contact support if the issue persists.",
          icon: AlertCircle,
          suggestions: [
            "Clear your browser cache and cookies",
            "Try using a different browser",
            "Check your internet connection"
          ]
        };  
    }
  };

  const errorDetails = getErrorDetails(error);
  const IconComponent = errorDetails.icon;

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Neural background particles - error theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-12 w-1.5 h-1.5 bg-red-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-36 right-16 w-1 h-1 bg-orange-400/25 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-20 w-2 h-2 bg-red-300/15 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-28 right-8 w-1 h-1 bg-yellow-400/20 rounded-full animate-ping" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        <div className="w-full max-w-lg relative z-10">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", "bg-red-500/10 border-red-500/20 text-red-300")}>
              <XCircle className="w-4 h-4 mr-2" />
              Authentication Failed
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              {errorDetails.title}
            </h1>
            <p className="text-gray-400">
              Don't worry, we can help you get back on track
            </p>
          </div>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            "hover:bg-white/[0.15] transition-all duration-500",
            "hover:shadow-2xl hover:shadow-red-500/10",
            "backdrop-blur-xl"
          )}>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                  <IconComponent className="h-5 w-5" />
                  <AlertDescription className="text-sm leading-relaxed">
                    {errorDetails.message}
                  </AlertDescription>
                </Alert>

                <div className={cn(
                  "p-4 rounded-lg",
                  "bg-white/5 border border-white/10"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-medium text-blue-300">What you can try:</p>
                  </div>
                  <ul className="space-y-2">
                    {errorDetails.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link href="/auth/signin" className="block">
                    <Button 
                      className={cn(
                        "w-full",
                        "bg-gradient-to-r",
                        themeConfig.colors.gradients.button,
                        "text-white font-medium relative overflow-hidden",
                        "hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        "transition-all duration-300",
                        "group"
                      )}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </Button>
                  </Link>

                  <Link href="/" className="block">
                    <Button 
                      variant="outline"
                      className={cn(
                        "w-full",
                        "bg-white/5 border-white/20 text-white",
                        "hover:bg-white/10 hover:border-white/30",
                        themeConfig.animation.transition
                      )}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Return to Home
                    </Button>
                  </Link>

                  {error === "CredentialsSignin" && (
                    <Link href="/auth/forgot-password" className="block">
                      <Button 
                        variant="ghost"
                        className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        Reset Password
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-2">
                    Still having trouble?
                  </p>
                  <Link 
                    href="/help"
                    className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Contact Support
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
} 