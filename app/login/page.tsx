'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase';
import SupabaseConfigNotice from '@/app/components/SupabaseConfigNotice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!hasSupabaseEnv()) {
      setError('Supabase is not configured.');
      return;
    }

    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="container">
      {!hasSupabaseEnv() ? <SupabaseConfigNotice /> : null}
      <div className="card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Login</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        <p className="row">
          <Link href="/forgot-password">Forgot Password?</Link>
          <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
