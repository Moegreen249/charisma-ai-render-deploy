"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error types
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password");
        } else if (result.error.includes("approval")) {
          setError("Your account is pending admin approval. Please wait for approval before signing in.");
        } else {
          setError("Authentication failed. Please try again.");
        }
      } else if (result?.ok) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get fresh session with retry logic
        let session = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (!session && retryCount < maxRetries) {
          session = await getSession();
          if (!session) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
          }
        }

        if (session?.user) {
          // Get redirect URL from query params or use role-based default
          const callbackUrl = searchParams.get('callbackUrl');
          let redirectUrl = '/analyze'; // Default for regular users

          if (session.user.role === "ADMIN") {
            redirectUrl = '/admin';
          }

          // Use callback URL if provided and safe
          if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
            redirectUrl = callbackUrl;
          }

          // Use window.location for more reliable redirect
          window.location.href = redirectUrl;
        } else {
          // Session not established after successful login
          setError("Login succeeded but session could not be established. Please try again.");
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      // Log error for debugging in development only
      if (process.env.NODE_ENV === 'development') {
        console.error("Login error:", error);
      }
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Neural background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-4 sm:left-10 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
          <div className="absolute top-40 right-8 sm:right-20 w-1 h-1 bg-blue-400/30 rounded-full animate-ping motion-reduce:animate-none"></div>
          <div className="absolute bottom-32 left-6 sm:left-16 w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-pulse motion-reduce:animate-none" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-4 sm:right-12 w-1 h-1 bg-purple-300/20 rounded-full animate-ping motion-reduce:animate-none" style={{ animationDelay: '2s' }}></div>
          {/* Additional particles hidden on small screens for performance */}
          <div className="hidden sm:block absolute top-1/3 right-1/4 w-1 h-1 bg-indigo-300/15 rounded-full animate-pulse motion-reduce:animate-none" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome Back
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Sign In to CharismaAI
            </h1>
            <p className="text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className={cn(
            "w-full max-w-md mx-auto", // Ensure proper mobile width
            "touch-pan-y", // Enable smooth touch scrolling
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            "hover:bg-white/[0.15] transition-all duration-500",
            "hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl"
          )}>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage && (
                  <Alert className="bg-green-500/10 border-green-500/20 text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "pl-10 h-12 sm:h-11", // Enhanced mobile touch target
                        "text-base sm:text-sm", // Prevent zoom on iOS
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        "touch-manipulation", // Optimize touch events
                        themeConfig.animation.transition
                      )}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "pl-10 pr-10 h-12 sm:h-11", // Enhanced mobile touch target
                        "text-base sm:text-sm", // Prevent zoom on iOS
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        "touch-manipulation", // Optimize touch events
                        themeConfig.animation.transition
                      )}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors touch-manipulation"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12 sm:h-11", // Enhanced mobile touch target
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium relative overflow-hidden",
                    "hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "transition-all duration-300",
                    "touch-manipulation", // Optimize touch events
                    "group"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Sign In</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full",
                    "bg-white/5 border-white/20 text-white",
                    "hover:bg-white/10 hover:border-white/30",
                    themeConfig.animation.transition
                  )}
                  disabled
                >
                  <span className="text-gray-400">Social login coming soon</span>
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
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