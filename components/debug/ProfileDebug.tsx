'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export function ProfileDebug() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    data: any;
  }>({
    loading: false,
    success: false,
    error: null,
    data: null
  });

  const testProfileAPI = async () => {
    setApiTest({ loading: true, success: false, error: null, data: null });
    
    try {
      console.log('🔍 Testing profile API...');
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (response.ok) {
        setApiTest({
          loading: false,
          success: true,
          error: null,
          data: data
        });
      } else {
        setApiTest({
          loading: false,
          success: false,
          error: `API Error ${response.status}: ${data.error || 'Unknown error'}`,
          data: data
        });
      }
    } catch (error) {
      setApiTest({
        loading: false,
        success: false,
        error: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      });
    }
  };

  useEffect(() => {
    // Auto-test on mount if user is logged in
    if (status === 'authenticated') {
      testProfileAPI();
    }
  }, [status]);

  return (
    <Card className="mb-6 bg-yellow-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center gap-2">
          🔍 Profile API Debug Tool
          <Button
            onClick={testProfileAPI}
            disabled={apiTest.loading}
            size="sm"
            variant="outline"
            className="ml-auto"
          >
            {apiTest.loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test API
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white text-sm space-y-4">
        {/* Session Info */}
        <div className="bg-black/20 rounded p-3">
          <h4 className="font-semibold mb-2">Session Status:</h4>
          <div className="space-y-1">
            <div><strong>Status:</strong> {status}</div>
            <div><strong>User ID:</strong> {session?.user?.id || 'Not available'}</div>
            <div><strong>Email:</strong> {session?.user?.email || 'Not available'}</div>
            <div><strong>Role:</strong> {session?.user?.role || 'Not available'}</div>
            <div><strong>Authenticated:</strong> {status === 'authenticated' ? '✅ Yes' : '❌ No'}</div>
          </div>
        </div>

        {/* API Test Results */}
        <div className="bg-black/20 rounded p-3">
          <h4 className="font-semibold mb-2">Profile API Test:</h4>
          
          {apiTest.loading && (
            <div className="flex items-center gap-2 text-blue-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Testing API...
            </div>
          )}
          
          {apiTest.success && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                API Test Successful
              </div>
              <div className="text-xs">
                <strong>Profile ID:</strong> {apiTest.data?.id || 'Not available'}
              </div>
              <div className="text-xs">
                <strong>Has Bio:</strong> {apiTest.data?.bio ? 'Yes' : 'No'}
              </div>
              <div className="text-xs">
                <strong>Skills Count:</strong> {apiTest.data?.skills?.length || 0}
              </div>
            </div>
          )}
          
          {apiTest.error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                API Test Failed
              </div>
              <div className="text-xs text-red-300">
                {apiTest.error}
              </div>
              {apiTest.data && (
                <details className="text-xs">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 p-2 bg-black/30 rounded overflow-auto">
                    {JSON.stringify(apiTest.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Reload Page
          </Button>
          <Button
            onClick={() => console.log('Session:', session, 'API Test:', apiTest)}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            Log to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}