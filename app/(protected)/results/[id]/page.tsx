'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type ResultRow = {
  file_name?: string;
  status?: string;
  error?: string;
  extracted_data?: Record<string, unknown>;
};

type Extraction = {
  id: string;
  status: string | null;
  created_at: string;
  result_json: ResultRow[] | null;
};

type MockExtractionPayload = {
  extractionId: string;
  message: string;
  results: ResultRow[];
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Extraction | null>(null);
  const [mockData, setMockData] = useState<MockExtractionPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id.startsWith('mock_')) {
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem(`mock_result_${params.id}`);
        if (raw) {
          setMockData(JSON.parse(raw) as MockExtractionPayload);
          return;
        }
      }
      setError('Mock extraction result not found in session.');
      return;
    }

    const load = async () => {
      const { data: row, error: rowError } = await getSupabaseClient()
        .from('extractions')
        .select('id, status, created_at, result_json')
        .eq('id', params.id)
        .single();

      if (rowError) {
        setError(rowError.message);
        return;
      }

      setData(row as Extraction);
    };

    void load();
  }, [params.id]);

  if (error) {
    return <section className="table-card"><h1>Results</h1><p className="error">{error}</p></section>;
  }

  if (mockData) {
    return (
      <section className="table-card">
        <h1>Extraction Results</h1>
        <p><strong>Mode:</strong> Mock local extraction</p>
        <p>{mockData.message}</p>
        <div className="file-list">
          {mockData.results.map((row, idx) => (
            <div key={`${row.file_name}-${idx}`} className={`file-row ${(row.status || '').toLowerCase() === 'failed' ? 'failed' : ''}`}>
              <span className="file-icon">📄</span>
              <span className="file-name">{row.file_name || 'Unknown file'}</span>
              <span className={`status-badge ${(row.status || '').toLowerCase() === 'failed' ? 'failed' : 'completed'}`}>
                {row.status || 'Completed'}
              </span>
              {row.error ? <span className="file-error">{row.error}</span> : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="table-card">
      <h1>Extraction Results</h1>
      {!data ? <p>Loading...</p> : null}
      {data ? (
        <>
          <p>Status: <strong>{data.status}</strong></p>
          <p>Date: {new Date(data.created_at).toLocaleString()}</p>
          <div className="file-list">
            {(data.result_json || []).map((row, idx) => (
              <div key={`${row.file_name}-${idx}`} className={`file-row ${(row.status || '').toLowerCase() === 'failed' ? 'failed' : ''}`}>
                <span className="file-icon">📄</span>
                <span className="file-name">{row.file_name || 'Unknown file'}</span>
                <span className={`status-badge ${(row.status || '').toLowerCase() === 'failed' ? 'failed' : 'completed'}`}>
                  {row.status || 'Completed'}
                </span>
                {row.error ? <span className="file-error">{row.error}</span> : null}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
