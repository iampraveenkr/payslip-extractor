'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess('If an account exists, a password reset link has been sent.');
  };

  return (
    <main className="container">
      <div className="card">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <button type="submit">Send reset link</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <p className="row">
          <span>Remembered your password?</span>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}
