'use client';

import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    router.replace('/login');
  };

  return (
    <main className="container">
      <div className="card">
        <h1>Dashboard</h1>
        <p>You are signed in to PayslipIQ.</p>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </main>
  );
}
