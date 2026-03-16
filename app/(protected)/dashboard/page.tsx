'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({ credits_used: 0, credits_limit: 10 });
  const [monthlyProcessed, setMonthlyProcessed] = useState(0);
  const [excelDownloads, setExcelDownloads] = useState(0);
  const [recentExtractions, setRecentExtractions] = useState<Extraction[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await getSupabaseClient().auth.getUser();

      if (!user) {
        return;
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [profileRes, monthlyRes, historyRes] = await Promise.all([
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
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      const processed = (monthlyRes.data || []).reduce((sum, row) => sum + (row.payslip_count || 0), 0);
      setMonthlyProcessed(processed);

      const rows = historyRes.data || [];
      setRecentExtractions(rows);
      setExcelDownloads(rows.filter((row) => row.status?.toLowerCase() === 'completed').length);
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
    }));
  }, [recentExtractions]);

  return (
    <section>
      <h1 className="dashboard-title">Dashboard Overview</h1>

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
                  <td>
                    <span className={`status-badge ${(row.status || '').toLowerCase()}`}>{row.status || 'Unknown'}</span>
                  </td>
                  <td>{(row.status || '').toLowerCase() === 'completed' ? <a href="#">Download</a> : '—'}</td>
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
