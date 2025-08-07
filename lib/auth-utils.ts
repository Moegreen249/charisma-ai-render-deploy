/**
 * Authentication utilities for handling login/logout operations
 */

import { signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * Enhanced logout function that ensures proper session cleanup
 */
export async function logout() {
  try {
    // Clear any local storage items related to auth
    if (typeof window !== 'undefined') {
      // Clear any auth-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('session') || key.includes('nextauth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear any auth-related sessionStorage items
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('auth') || key.includes('session') || key.includes('nextauth'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    // Perform NextAuth signOut with proper configuration
    await nextAuthSignOut({
      callbackUrl: '/',
      redirect: true
    });

    // Force a hard refresh to ensure all state is cleared
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: force redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: any): boolean {
  return !!(session?.user?.id);
}

/**
 * Check if user is admin
 */
export function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN';
}