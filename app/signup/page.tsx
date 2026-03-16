'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Toast from '@/app/components/Toast';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const { data, error: signUpError } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await getSupabaseClient().from('users_profile').upsert({
        id: data.user.id,
        full_name: fullName,
        company_name: companyName,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }
    }

    setToastMessage('Account created! Welcome to PayslipIQ');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <main className="container">
      <div className="card">
        <h1>Create your account</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <label htmlFor="companyName">Company Name</label>
          <input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Create Account</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        <p className="row">
          <span>Already have an account?</span>
          <Link href="/login">Login</Link>
        </p>
      </div>
      {toastMessage ? <Toast message={toastMessage} onClose={() => setToastMessage('')} /> : null}
    </main>
  );
}
