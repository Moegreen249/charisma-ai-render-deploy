/**
 * Shared types for client-side components
 * This file exports types without importing Prisma directly,
 * preventing "PrismaClient is unable to run in this browser environment" errors
 */

// Re-export Prisma types for client components
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  INCOMPLETE = 'INCOMPLETE'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Define basic subscription type without full Prisma model
export interface UserSubscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

// Basic user type for client components
export interface BasicUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Subscription plan and usage interfaces for client components
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: readonly PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  storiesPerMonth: number; // -1 for unlimited
  apiCallsPerMonth: number; // -1 for unlimited
  maxFileSize: number; // MB
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  concurrentTasks: number;
}

export interface UsageMetrics {
  storiesGenerated: number;
  storiesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  periodStart: Date;
  periodEnd: Date;
  filesProcessed: number;
  filesLimit: number;
}

// Utility type helpers for type safety
export type SubscriptionTierKeys = keyof typeof SubscriptionTier;
export type SubscriptionStatusKeys = keyof typeof SubscriptionStatus;
export type RoleKeys = keyof typeof Role;