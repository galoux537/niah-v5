import React, { useEffect, useState } from 'react';
import { testConnection } from '../src/lib/supabase';

interface ConnectionStatus {
  connected: boolean;
  error: string | null;
  loading: boolean;
}

export function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    error: null,
    loading: true
  });

  useEffect(() => {
    const checkConnection = async () => {
      setStatus(prev => ({ ...prev, loading: true }));
      
      try {
        const result = await testConnection();
        setStatus({
          connected: result.connected,
          error: result.error,
          loading: false
        });
      } catch (err) {
        setStatus({
          connected: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          loading: false
        });
      }
    };

    checkConnection();
  }, []);

  if (status.loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 max-w-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-800 text-sm">Testing connection...</span>
        </div>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 rounded-lg p-4 max-w-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          <span className="text-green-800 text-sm">✅ Supabase Connected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 max-w-sm">
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0 mt-0.5"></div>
        <div>
          <div className="text-red-800 text-sm font-medium">❌ Connection Failed</div>
          <div className="text-red-700 text-xs mt-1">{status.error}</div>
        </div>
      </div>
    </div>
  );
}
