/**
 * Comprehensive input validation schemas for security
 */
import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format').max(255);
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const uuidSchema = z.string().uuid('Invalid UUID format');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').trim();

// File validation
export const fileTypeSchema = z.enum(['text/plain', 'application/json', 'text/csv', 'application/pdf'], {
  errorMap: () => ({ message: 'File type not supported. Only text, JSON, CSV, and PDF files are allowed.' })
});

export const fileSizeSchema = z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB');

// AI Provider validation
export const aiProviderSchema = z.enum(['openai', 'anthropic', 'google', 'google-vertex-ai', 'google-genai']);
export const aiModelSchema = z.string().min(1, 'Model ID is required').max(100);

// Analysis validation
export const analysisRequestSchema = z.object({
  templateId: uuidSchema,
  modelId: aiModelSchema,
  provider: aiProviderSchema,
  fileName: z.string().min(1, 'File name is required').max(255),
  fileContent: z.string().min(1, 'File content is required').max(1024 * 1024, 'File content too large'), // 1MB limit
});

// User profile validation
export const userProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  dateOfBirth: z.string().datetime().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/, 'Invalid phone number format').optional(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  skills: z.array(z.string().max(50)).max(20, 'Maximum 20 skills allowed'),
  socialLinks: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional(),
    github: z.string().url('Invalid GitHub URL').optional(),
    website: z.string().url('Invalid website URL').optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
  }).optional(),
  isPublic: z.boolean(),
});

// Authentication validation
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// Admin validation schemas
export const userRoleSchema = z.enum(['USER', 'ADMIN']);

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema,
});

// Security: Sanitization helpers
export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - remove script tags and potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove potentially dangerous characters from file names
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255)
    .trim();
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1).max(100), // IP or user ID
  action: z.string().min(1).max(50), // Action type
  timestamp: z.number().int().positive(),
});

// Error validation
export const errorReportSchema = z.object({
  message: z.string().min(1).max(1000),
  stack: z.string().max(10000).optional(),
  userAgent: z.string().max(500).optional(),
  url: z.string().max(500).optional(),
  userId: uuidSchema.optional(),
});

// Type exports for TypeScript
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type ErrorReport = z.infer<typeof errorReportSchema>;