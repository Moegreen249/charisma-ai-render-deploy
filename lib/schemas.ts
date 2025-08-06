import { z } from 'zod';

// Define Role enum locally since we can't import from Prisma in this context
export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role).default(Role.USER),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  email: z.string().email('Invalid email address').max(255).optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userPasswordUpdateSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// User template schemas
export const userTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().default('custom'),
  icon: z.string().max(10).default('✨'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  analysisPrompt: z.string().min(1, 'Analysis prompt is required'),
});

export const userTemplateUpdateSchema = userTemplateCreateSchema.partial(); // All fields optional for update

// Analysis module schemas
export const moduleCreateSchema = z.object({
  name: z.string().min(1, 'Module name is required').max(100),
  description: z.string().max(500).optional(),
  instructionPrompt: z.string().min(1, 'Instruction prompt is required'),
  expectedJsonHint: z.string().min(1, 'Expected JSON hint is required').refine(s => { 
    try { 
      JSON.parse(s); 
      return true; 
    } catch { 
      return false; 
    } 
  }, 'Invalid JSON string'),
  category: z.string().default('general'),
  icon: z.string().max(10).default('✨'),
  isActive: z.boolean().default(true),
  isBuiltIn: z.boolean().default(false), // Should be set by system, not directly by form for creation
});

export const moduleUpdateSchema = z.object({
  name: z.string().min(1, 'Module name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  instructionPrompt: z.string().min(1, 'Instruction prompt is required').optional(),
  expectedJsonHint: z.string().min(1, 'Expected JSON hint is required').refine(s => { 
    try { 
      JSON.parse(s); 
      return true; 
    } catch { 
      return false; 
    } 
  }, 'Invalid JSON string').optional(),
  category: z.string().optional(),
  icon: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
  // isBuiltIn should not be updatable via this schema
});

// Subscription schemas
export const SubscriptionTier = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export const subscriptionUpgradeSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  stripeSubscriptionId: z.string().optional(),
  billingEmail: z.string().email().optional()
});

export const subscriptionCancelSchema = z.object({
  immediate: z.boolean().default(false),
  reason: z.string().max(500).optional(),
  feedback: z.string().max(1000).optional()
});

// Admin schemas
export const adminConfigSchema = z.object({
  category: z.enum(['ai_models', 'system', 'billing', 'features']),
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const modelConfigSchema = z.object({
  provider: z.string(),
  models: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    costPerToken: z.number().min(0),
    maxTokens: z.number().min(1),
    timeout: z.number().min(1000),
    parameters: z.record(z.any())
  })),
  enabled: z.boolean(),
  timeout: z.number().min(1000)
});

export const userManagementSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['update_role', 'update_subscription', 'suspend', 'activate', 'delete']),
  data: z.record(z.any()).optional()
});

export const systemMetricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day', 'week']).default('day'),
  category: z.string().optional()
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPasswordUpdateInput = z.infer<typeof userPasswordUpdateSchema>;
export type UserTemplateCreateInput = z.infer<typeof userTemplateCreateSchema>;
export type UserTemplateUpdateInput = z.infer<typeof userTemplateUpdateSchema>;
export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type ModuleUpdateInput = z.infer<typeof moduleUpdateSchema>;
export type SubscriptionUpgradeInput = z.infer<typeof subscriptionUpgradeSchema>;
export type SubscriptionCancelInput = z.infer<typeof subscriptionCancelSchema>;
export type AdminConfigInput = z.infer<typeof adminConfigSchema>;
export type ModelConfigInput = z.infer<typeof modelConfigSchema>;
export type UserManagementInput = z.infer<typeof userManagementSchema>;
export type SystemMetricsQueryInput = z.infer<typeof systemMetricsQuerySchema>; 