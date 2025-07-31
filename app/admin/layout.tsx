'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import Logo from '@/components/ui/logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Logo size="xl" variant="white" />
          <div className="mt-4 w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}