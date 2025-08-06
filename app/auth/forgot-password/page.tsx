'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Send, Key } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate email
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setMessage({ 
          type: 'success', 
          text: 'If an account with this email exists, you will receive a password reset link shortly.' 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
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
              <Key className="w-4 h-4 mr-2" />
              Password Recovery
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Forgot Password?
            </h1>
            <p className="text-gray-400">
              {emailSent 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive a password reset link"
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
              {!emailSent ? (
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
                    <Label htmlFor="email" className="text-white">Email Address</Label>
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
                        disabled={isLoading}
                        required
                      />
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
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Reset Link...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Reset Link
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
                      Reset Link Sent
                    </h3>
                    <p className="text-gray-400 text-sm">
                      We've sent a password reset link to <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  <div className={cn(
                    "p-4 rounded-lg",
                    "bg-white/5 border border-white/10"
                  )}>
                    <p className="text-sm text-gray-300 mb-2">Next steps:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Check your email inbox
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Look in spam/junk folder if needed
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Click the reset link (expires in 24 hours)
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      setMessage(null);
                    }}
                    variant="outline"
                    className={cn(
                      "w-full",
                      "bg-white/5 border-white/20 text-white",
                      "hover:bg-white/10 hover:border-white/30",
                      themeConfig.animation.transition
                    )}
                  >
                    Send to Different Email
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Remember your password?{' '}
                  <Link
                    href="/auth/signin"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign in
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