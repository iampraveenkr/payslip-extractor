'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type Profile = {
  full_name: string | null;
  company_name: string | null;
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/extract', label: 'Extract Payslips', icon: '⬆️' },
  { href: '/history', label: 'History', icon: '🕒' },
  { href: '/api-access', label: 'API Access', icon: '💻' },
  { href: '/billing', label: 'Billing', icon: '💳' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ full_name: null, company_name: null });

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await getSupabaseClient().auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await getSupabaseClient()
        .from('users_profile')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    void loadProfile();
  }, []);

  const initials = useMemo(() => {
    const source = profile.full_name?.trim() || 'User';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [profile.full_name]);

  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="logo">PayslipIQ</div>
          <nav className="nav-list">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">{initials}</div>
          <div>
            <div className="user-name">{profile.full_name || 'PayslipIQ User'}</div>
            <div className="company-name">{profile.company_name || 'Your Company'}</div>
          </div>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
