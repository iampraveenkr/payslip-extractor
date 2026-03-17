'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase';
import SupabaseConfigNotice from '@/app/components/SupabaseConfigNotice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data, error } = await getSupabaseClient().auth.getSession();

        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return;
        }

        if (!data.session) {
          router.replace('/login');
          return;
        }

        setLoading(false);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Authentication check failed.');
        setLoading(false);
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!hasSupabaseEnv()) {
    return (
      <main className="container">
        <SupabaseConfigNotice />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card">Checking authentication...</div>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="container">
        <div className="error-card">{authError}</div>
      </main>
    );
  }

  return <>{children}</>;
}
