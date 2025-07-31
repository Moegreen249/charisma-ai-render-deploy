'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, Shield, Key, Eye, EyeOff, CheckCircle, AlertCircle, Check, X } from 'lucide-react';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getPasswordRequirements = (password: string) => {
    return [
      { text: 'At least 8 characters long', met: password.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Contains number', met: /\d/.test(password) },
      { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  };

  const validatePassword = (password: string) => {
    const requirements = getPasswordRequirements(password);
    const unmet = requirements.find(req => !req.met);
    return unmet ? unmet.text.replace('Contains', 'Must contain').replace('At least', 'Must be at least') : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = getPasswordRequirements(newPassword);

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <Key className="w-4 h-4 mr-2" />
              Update Security
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Change Password
            </h1>
            <p className="text-gray-400">
              Update your password to keep your account secure
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
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-500/10 border-green-500/20 text-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Password changed successfully! Redirecting...</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-white">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
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
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        confirmPassword && newPassword !== confirmPassword && "border-red-500",
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
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {newPassword && (
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
                  disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Changing Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Change Password
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link 
              href="/settings"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to settings
            </Link>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
