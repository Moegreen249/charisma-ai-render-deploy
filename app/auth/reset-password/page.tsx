'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, Shield, Eye, EyeOff, Check, X } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        setTokenValid(response.ok);
        if (!response.ok) {
          const data = await response.json();
          setMessage({ type: 'error', text: data.error || 'Invalid or expired reset token' });
        }
      } catch (error) {
        setTokenValid(false);
        setMessage({ type: 'error', text: 'Failed to verify reset token' });
      }
    };

    verifyToken();
  }, [token]);

  const getPasswordRequirements = (password: string) => {
    return [
      { text: 'At least 8 characters long', met: password.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Contains number', met: /\d/.test(password) },
      { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const requirements = getPasswordRequirements(password);
    const unmetRequirement = requirements.find(req => !req.met);
    if (unmetRequirement) {
      setMessage({ type: 'error', text: `Password must meet all requirements` });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetComplete(true);
        setMessage({ 
          type: 'success', 
          text: 'Password reset successfully! You can now sign in with your new password.' 
        });
        // Redirect to signin after a delay
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully! Please sign in with your new password.');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = getPasswordRequirements(password);

  // If token is invalid, show error state
  if (tokenValid === false) {
    return (
      <UnifiedLayout variant="auth" showFooter={false}>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Badge className={cn("mb-4", "bg-red-500/10 border-red-500/20 text-red-300")}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Invalid Token
              </Badge>
              <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
                Reset Link Expired
              </h1>
              <p className="text-gray-400">
                This password reset link is invalid or has expired
              </p>
            </div>

            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border"
            )}>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      "bg-red-500/20 border border-red-500/30"
                    )}>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Link No Longer Valid
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Password reset links expire after 24 hours for security reasons.
                    </p>
                  </div>

                  <Link href="/auth/forgot-password">
                    <Button
                      className={cn(
                        "w-full",
                        "bg-gradient-to-r",
                        themeConfig.colors.gradients.button,
                        "text-white font-medium",
                        "hover:opacity-90",
                        themeConfig.animation.transition
                      )}
                    >
                      Request New Reset Link
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Loading state while verifying token
  if (tokenValid === null) {
    return (
      <UnifiedLayout variant="auth" showFooter={false}>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Verifying reset link...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <Shield className="w-4 h-4 mr-2" />
              Reset Password
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              {resetComplete ? 'Password Updated!' : 'Create New Password'}
            </h1>
            <p className="text-gray-400">
              {resetComplete 
                ? 'Your password has been successfully reset' 
                : 'Enter a strong new password for your account'
              }
            </p>
          </div>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border"
          )}>
            <CardContent className="pt-6">
              {!resetComplete ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <Alert className={cn(
                      message.type === 'error' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                        : 'bg-green-500/10 border-green-500/20 text-green-200'
                    )}>
                      {message.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          "pl-10 pr-10",
                          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}
                        disabled={isLoading}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          "pl-10 pr-10",
                          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                          "focus:bg-white/20 focus:border-purple-400",
                          confirmPassword && password !== confirmPassword && "border-red-500",
                          themeConfig.animation.transition
                        )}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {password && (
                    <div className={cn(
                      "p-4 rounded-lg",
                      "bg-white/5 border border-white/10"
                    )}>
                      <p className="text-sm text-gray-300 mb-3">Password Requirements:</p>
                      <div className="space-y-2">
                        {requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {req.met ? (
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                            ) : (
                              <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                            )}
                            <span className={req.met ? "text-green-300" : "text-gray-400"}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Password...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Update Password
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      "bg-green-500/20 border border-green-500/30"
                    )}>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Password Reset Complete
                    </h3>
                    <p className="text-gray-400 text-sm">
                      You can now sign in with your new password. You'll be redirected to sign in shortly.
                    </p>
                  </div>

                  <Link href="/auth/signin">
                    <Button
                      className={cn(
                        "w-full",
                        "bg-gradient-to-r",
                        themeConfig.colors.gradients.button,
                        "text-white font-medium",
                        "hover:opacity-90",
                        themeConfig.animation.transition
                      )}
                    >
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              )}
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