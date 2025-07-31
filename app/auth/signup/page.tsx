'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';
import LegalModal from '@/components/ui/legal-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, ArrowLeft, UserPlus, Mail, User, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/signin?message=Account created successfully! Please wait for admin approval to sign in.');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getPasswordStrength = () => {
    if (formData.password.length < 6) return { level: 'weak', color: 'bg-red-500', text: 'Weak' };
    if (formData.password.length < 8) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { level: 'strong', color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <UnifiedLayout variant="auth" showFooter={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Join CharismaAI
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Create Your Account
            </h1>
            <p className="text-gray-400">
              Start analyzing your conversations with AI-powered insights
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

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
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
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1 flex-1 rounded-full", passwordStrength.color)} />
                      </div>
                      <p className="text-xs text-gray-400">
                        Password strength: {passwordStrength.text}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={cn(
                        "pl-10 pr-10",
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        formData.confirmPassword && formData.password !== formData.confirmPassword && "border-red-500",
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
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-1 border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                      >
                        Privacy Policy
                      </button>
                    </label>
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
                  disabled={isLoading || !acceptedTerms}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
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

      {/* Legal Modals */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
      />
      <LegalModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
      />
    </UnifiedLayout>
  );
}