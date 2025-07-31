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
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle, Sparkles, Eye, EyeOff } from "lucide-react";
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
        setError("Invalid email or password");
      } else {
        // Check if user is admin and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border"
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
                        "pl-10",
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
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
                        "pl-10 pr-10",
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className={cn(
                    "w-full",
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium",
                    "hover:opacity-90",
                    themeConfig.animation.transition,
                    themeConfig.animation.hover
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
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