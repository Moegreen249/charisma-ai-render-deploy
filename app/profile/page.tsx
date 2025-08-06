'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Phone, MapPin, Calendar, Building, Briefcase, Globe, Camera, Save, Eye, EyeOff, Plus, X, Settings, Shield, Star, Upload, Link as LinkIcon, Github, Twitter, Linkedin, Instagram, Copy, ExternalLink } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  skills: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    theme?: string;
    notifications?: boolean;
    newsletter?: boolean;
  };
  isPublic: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  // Calculate profile completion percentage
  useEffect(() => {
    if (profile) {
      const fields = [
        profile.bio,
        profile.avatar || avatarPreview,
        profile.website,
        profile.location,
        profile.phone,
        profile.company,
        profile.jobTitle,
        profile.skills?.length > 0,
        profile.socialLinks?.twitter,
        profile.socialLinks?.linkedin,
        profile.socialLinks?.github
      ];
      
      const completedFields = fields.filter(field => 
        field && (typeof field === 'boolean' ? field : field.trim() !== '')
      ).length;
      
      const percentage = Math.round((completedFields / fields.length) * 100);
      setProfileCompletion(percentage);
    }
  }, [profile, avatarPreview]);

  // Detect unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        setShowUnsavedWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...');
      const response = await fetch('/api/user/profile');
      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch error:', response.status, errorData);
        setMessage({ 
          type: 'error', 
          text: errorData.error || `Failed to load profile (${response.status})` 
        });
      }
    } catch (error) {
      console.error('Profile fetch exception:', error);
      setMessage({ 
        type: 'error', 
        text: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && profile) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter(skill => skill !== skillToRemove),
      });
    }
  };

  const updateProfile = (field: string, value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
  };

  const updateSocialLinks = (platform: string, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        socialLinks: {
          ...profile.socialLinks,
          [platform]: value,
        },
      });
    }
  };

  const updatePreferences = (field: string, value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          [field]: value,
        },
      });
    }
  };

  if (loading) {
    return (
      <UnifiedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (!profile) {
    return (
      <UnifiedLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className={cn("text-2xl font-bold mb-2", themeConfig.typography.gradient)}>
              Profile Not Found
            </h2>
            <p className="text-gray-400 mb-6">Unable to load your profile information.</p>
            <Button 
              onClick={() => window.location.reload()}
              className={cn(
                "bg-gradient-to-r",
                themeConfig.colors.gradients.button,
                "text-white font-medium",
                "hover:opacity-90",
                themeConfig.animation.transition
              )}
            >
              Try Again
            </Button>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <Settings className="w-4 h-4 mr-2" />
              Account Management
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Profile Settings
            </h1>
            <p className="text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          {/* Message */}
          {message && (
            <Alert className={cn(
              "mb-6",
              message.type === 'error' 
                ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                : 'bg-green-500/10 border-green-500/20 text-green-200'
            )}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Profile Categories - Smaller Blog Style Navigation */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                    "hover:border-white/30 transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10",
                    activeTab === "personal" && "border-blue-500/50 bg-blue-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-blue-600 to-cyan-600",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                        Personal Info
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Basic Details
                      </p>
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full bg-blue-500"
                    ></div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("professional")}
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                    "hover:border-white/30 transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10",
                    activeTab === "professional" && "border-green-500/50 bg-green-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-green-600 to-emerald-600",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm group-hover:text-green-300 transition-colors">
                        Professional
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Work & Skills
                      </p>
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full bg-green-500"
                    ></div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("social")}
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                    "hover:border-white/30 transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10",
                    activeTab === "social" && "border-purple-500/50 bg-purple-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-purple-600 to-pink-600",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                        Social Links
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Online Presence
                      </p>
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full bg-purple-500"
                    ></div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("preferences")}
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                    "hover:border-white/30 transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10",
                    activeTab === "preferences" && "border-orange-500/50 bg-orange-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-orange-600 to-red-600",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm group-hover:text-orange-300 transition-colors">
                        Preferences
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        App Settings
                      </p>
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full bg-orange-500"
                    ></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Completion Indicator */}
                  <div className={cn(
                    "p-4 rounded-lg mb-6",
                    themeConfig.colors.glass.background,
                    "border border-white/10"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Profile Completion</span>
                      <span className="text-purple-400 font-bold">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                    <p className="text-gray-400 text-sm mt-2">
                      Complete your profile to unlock all features
                    </p>
                  </div>

                  {/* Enhanced Avatar Upload */}
                  <div className="space-y-4">
                    <Label className="text-white font-medium">Profile Picture</Label>
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <div className={cn(
                          "w-24 h-24 rounded-full flex items-center justify-center overflow-hidden",
                          "bg-white/10 border-2 border-white/20",
                          "hover:border-purple-400/50 transition-all duration-300"
                        )}>
                          {avatarPreview || profile.avatar ? (
                            <img 
                              src={avatarPreview || profile.avatar} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="h-10 w-10 text-purple-400" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className={cn(
                            "absolute -bottom-2 -right-2 w-8 h-8 rounded-full",
                            "bg-purple-600 hover:bg-purple-700",
                            "flex items-center justify-center",
                            "border-2 border-gray-900",
                            themeConfig.animation.transition
                          )}
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAvatarFile(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setAvatarPreview(e.target?.result as string);
                                setHasUnsavedChanges(true);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-white text-sm">
                          <p className="font-medium">Upload a new photo</p>
                          <p className="text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          {(avatarPreview || profile.avatar) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAvatarPreview(null);
                                setAvatarFile(null);
                                setProfile(prev => prev ? { ...prev, avatar: '' } : null);
                                setHasUnsavedChanges(true);
                              }}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar URL Field (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl" className="text-white">Avatar URL (Optional)</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar || ''}
                      onChange={(e) => updateProfile('avatar', e.target.value)}
                      className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                    />
                    <p className="text-xs text-gray-400">
                      Alternative to file upload - provide a direct URL to your avatar image
                    </p>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.user.name}
                        disabled
                        className={cn(
                          "bg-white/5 border-white/10 text-gray-300",
                          "cursor-not-allowed opacity-75"
                        )}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Contact support to change your name
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.user.email}
                        disabled
                        className={cn(
                          "bg-white/5 border-white/10 text-gray-300",
                          "cursor-not-allowed opacity-75"
                        )}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="text-white">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio || ''}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      rows={4}
                      maxLength={500}
                      className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(profile.bio || '').length}/500 characters
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          className={cn(
                            "pl-10",
                            "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                            "focus:bg-white/20 focus:border-purple-400",
                            themeConfig.animation.transition
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          placeholder="City, Country"
                          value={profile.location || ''}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          className={cn(
                            "pl-10",
                            "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                            "focus:bg-white/20 focus:border-purple-400",
                            themeConfig.animation.transition
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
                        onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                        className={cn(
                          "pl-10",
                          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}
                      />
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isPublic"
                      checked={profile.isPublic}
                      onCheckedChange={(checked) => updateProfile('isPublic', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label htmlFor="isPublic" className="text-white">Make profile public</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Briefcase className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Add your work experience and skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company" className="text-white">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          placeholder="Company Name"
                          value={profile.company || ''}
                          onChange={(e) => updateProfile('company', e.target.value)}
                          className={cn(
                            "pl-10",
                            "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                            "focus:bg-white/20 focus:border-purple-400",
                            themeConfig.animation.transition
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="jobTitle"
                          placeholder="Your Job Title"
                          value={profile.jobTitle || ''}
                          onChange={(e) => updateProfile('jobTitle', e.target.value)}
                          className={cn(
                            "pl-10",
                            "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                            "focus:bg-white/20 focus:border-purple-400",
                            themeConfig.animation.transition
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={profile.website || ''}
                        onChange={(e) => updateProfile('website', e.target.value)}
                        className={cn(
                          "pl-10",
                          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="text-white">Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} className={cn(
                          "bg-purple-600/20 border-purple-500/30 text-purple-200",
                          "flex items-center gap-1"
                        )}>
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className={cn(
                          "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}
                      />
                      <Button 
                        onClick={addSkill} 
                        size="sm"
                        className={cn(
                          "bg-purple-600 hover:bg-purple-700",
                          "text-white",
                          themeConfig.animation.transition
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Links */}
            <TabsContent value="social" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your social media profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="twitter" className="text-white">Twitter</Label>
                    <Input
                      id="twitter"
                      placeholder="https://twitter.com/username"
                      value={profile.socialLinks?.twitter || ''}
                      onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                      className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={profile.socialLinks?.linkedin || ''}
                      onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                      className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-white">GitHub</Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={profile.socialLinks?.github || ''}
                      onChange={(e) => updateSocialLinks('github', e.target.value)}
                      className={cn(
                        "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                        "focus:bg-white/20 focus:border-purple-400",
                        themeConfig.animation.transition
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-400">
                        Receive email notifications about your account
                      </p>
                    </div>
                    <Checkbox
                      checked={profile.preferences?.notifications ?? true}
                      onCheckedChange={(checked) => updatePreferences('notifications', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Newsletter</Label>
                      <p className="text-sm text-gray-400">
                        Subscribe to our newsletter for updates
                      </p>
                    </div>
                    <Checkbox
                      checked={profile.preferences?.newsletter ?? false}
                      onCheckedChange={(checked) => updatePreferences('newsletter', checked)}
                      className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end" style={{ marginTop: '0.5px' }}>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className={cn(
                "min-w-32",
                "bg-gradient-to-r",
                themeConfig.colors.gradients.button,
                "text-white font-medium",
                "hover:opacity-90",
                themeConfig.animation.transition,
                themeConfig.animation.hover
              )}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}