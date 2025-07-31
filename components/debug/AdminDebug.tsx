'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDebug() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  return (
    <Card className="mb-4 bg-yellow-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-yellow-400">🔍 Admin Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-white text-sm">
        <div className="space-y-2">
          <div><strong>Status:</strong> {status}</div>
          <div><strong>User ID:</strong> {session?.user?.id || 'Not found'}</div>
          <div><strong>Email:</strong> {session?.user?.email || 'Not found'}</div>
          <div><strong>Name:</strong> {session?.user?.name || 'Not found'}</div>
          <div><strong>Role:</strong> {session?.user?.role || 'Not found'}</div>
          <div><strong>Is Admin:</strong> {session?.user?.role === 'ADMIN' ? 'YES' : 'NO'}</div>
        </div>
        <div className="mt-4 p-2 bg-black/20 rounded text-xs">
          <strong>Full Session:</strong>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
}