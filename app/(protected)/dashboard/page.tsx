'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase';

type Profile = {
  credits_used: number | null;
  credits_limit: number | null;
};

type Extraction = {
  id: string;
  file_names: string[] | null;
  payslip_count: number | null;
  status: string | null;
  created_at: string;
};

function statusClass(status: string | null) {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'completed') return 'completed';
  if (normalized === 'processing') return 'processing';
  if (normalized === 'failed') return 'failed';
  return 'processing';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({ credits_used: 0, credits_limit: 10 });
  const [monthlyProcessed, setMonthlyProcessed] = useState(0);
  const [excelDownloads, setExcelDownloads] = useState(0);
  const [recentExtractions, setRecentExtractions] = useState<Extraction[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    const loadData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await getSupabaseClient().auth.getUser();

        if (userError) {
          setLoadError(userError.message);
          return;
        }

        if (!user) {
          return;
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [profileRes, monthlyRes, recentRes, allHistoryRes] = await Promise.all([
          getSupabaseClient()
            .from('users_profile')
            .select('credits_used, credits_limit')
            .eq('id', user.id)
            .single(),
          getSupabaseClient()
            .from('extractions')
            .select('payslip_count')
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString()),
          getSupabaseClient()
            .from('extractions')
            .select('id, file_names, payslip_count, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          getSupabaseClient()
            .from('extractions')
            .select('status')
            .eq('user_id', user.id),
        ]);

        if (profileRes.error || monthlyRes.error || recentRes.error || allHistoryRes.error) {
          const firstError = profileRes.error || monthlyRes.error || recentRes.error || allHistoryRes.error;
          setLoadError(firstError?.message || 'Failed to load dashboard data.');
          return;
        }

        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        const processed = (monthlyRes.data || []).reduce((sum, row) => sum + (row.payslip_count || 0), 0);
        setMonthlyProcessed(processed);

        const rows = recentRes.data || [];
        setRecentExtractions(rows);

        const completedDownloads = (allHistoryRes.data || []).filter(
          (row) => row.status?.toLowerCase() === 'completed',
        ).length;
        setExcelDownloads(completedDownloads);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load dashboard data.');
      }
    };

    void loadData();
  }, []);

  const creditsUsed = profile.credits_used || 0;
  const creditsLimit = profile.credits_limit || 10;
  const creditsRemaining = Math.max(creditsLimit - creditsUsed, 0);
  const usagePercent = creditsLimit > 0 ? Math.min((creditsUsed / creditsLimit) * 100, 100) : 0;
  const lowCredits = creditsLimit > 0 && creditsUsed / creditsLimit >= 0.8;

  const rows = useMemo(() => {
    return recentExtractions.map((entry) => ({
      ...entry,
      fileLabel: entry.file_names?.join(', ') || 'Untitled file',
      dateLabel: new Date(entry.created_at).toLocaleDateString(),
      statusLabel: entry.status || 'Processing',
    }));
  }, [recentExtractions]);

  return (
    <section>
      <h1 className="dashboard-title">Dashboard Overview</h1>
      {loadError ? <div className="error-card">{loadError}</div> : null}

      <div className="stats-grid">
        <div className="stat-card"><p>Payslips Processed This Month</p><h3>{monthlyProcessed}</h3></div>
        <div className="stat-card"><p>Credits Remaining</p><h3>{creditsRemaining}</h3></div>
        <div className="stat-card"><p>Excel Files Downloaded</p><h3>{excelDownloads}</h3></div>
        <div className="stat-card"><p>Avg Processing Time</p><h3>8 seconds</h3></div>
      </div>

      <div className="quick-action">
        <h2>Extract Payslips Now</h2>
        <p>Upload PDFs and get structured Excel in seconds</p>
        <Link className="primary-link" href="/extract">Start Extraction</Link>
      </div>

      <div className="table-card">
        <h2>Recent Extractions</h2>
        {rows.length === 0 ? (
          <p className="empty-state">No extractions yet. Upload your first payslip!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date</th>
                <th>Payslips Count</th>
                <th>Status</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.fileLabel}</td>
                  <td>{row.dateLabel}</td>
                  <td>{row.payslip_count || 0}</td>
                  <td><span className={`status-badge ${statusClass(row.status)}`}>{row.statusLabel}</span></td>
                  <td>{statusClass(row.status) === 'completed' ? 'Available' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="usage-card">
        <h2>Monthly Usage</h2>
        <p>{creditsUsed} out of {creditsLimit} payslips used</p>
        <div className="usage-bar"><span style={{ width: `${usagePercent}%` }} /></div>
        {lowCredits ? <p className="usage-warning">Running low on credits. Upgrade your plan</p> : null}
      </div>
    </section>
  );
}
