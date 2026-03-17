'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, hasSupabaseEnv } from '@/lib/supabase';

type SelectedFile = {
  id: string;
  file: File;
  status?: 'pending' | 'failed' | 'completed';
  error?: string;
};

const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxBytes = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function ExtractPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const totalCreditsUsed = files.length;

  useEffect(() => {
    const loadCredits = async () => {
      if (!hasSupabaseEnv()) return;
      const {
        data: { user },
      } = await getSupabaseClient().auth.getUser();
      if (!user) return;
      const { data } = await getSupabaseClient()
        .from('users_profile')
        .select('credits_used, credits_limit')
        .eq('id', user.id)
        .single();
      if (data) {
        setCreditsRemaining((data.credits_limit || 10) - (data.credits_used || 0));
      }
    };

    void loadCredits();
  }, []);

  const progressPercent = files.length > 0 ? Math.round((currentFileIndex / files.length) * 100) : 0;

  const addFiles = (incoming: FileList | File[]) => {
    const array = Array.from(incoming);
    const next: SelectedFile[] = [];
    const errors: string[] = [];

    array.forEach((file) => {
      if (!supportedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported type`);
        return;
      }
      if (file.size > maxBytes) {
        errors.push(`${file.name}: Exceeds 10MB`);
        return;
      }
      next.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, status: 'pending' });
    });

    setGeneralError(errors.length ? errors.join(' • ') : '');
    setFiles((prev) => [...prev, ...next]);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (processing) return;
    setDragging(false);
    if (event.dataTransfer.files?.length) {
      addFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    if (processing) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleExtract = async () => {
    if (processing || files.length === 0) return;
    setProcessing(true);
    setGeneralError('');
    setStatusMessage('AI is reading your payslips...');

    try {
      const {
        data: { session },
      } = await getSupabaseClient().auth.getSession();

      if (!session?.access_token) {
        throw new Error('Please login again before extracting.');
      }

      const payloadFiles = [] as Array<{ name: string; type: string; size: number; base64: string }>;

      for (let i = 0; i < files.length; i += 1) {
        setCurrentFileIndex(i + 1);
        const selected = files[i];
        const base64 = await toBase64(selected.file);
        payloadFiles.push({
          name: selected.file.name,
          type: selected.file.type,
          size: selected.file.size,
          base64,
        });
      }

      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ files: payloadFiles }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Extraction failed.');
      }

      setStatusMessage(data.message);

      setFiles((prev) =>
        prev.map((entry) => {
          const result = (data.results || []).find((item: { file_name?: string }) => item.file_name === entry.file.name);
          if (!result) return entry;
          return {
            ...entry,
            status: result.status === 'Completed' ? 'completed' : 'failed',
            error: result.error,
          };
        }),
      );

      router.push(`/results/${data.extractionId}`);
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Unexpected extraction error.');
    } finally {
      setProcessing(false);
      setCurrentFileIndex(0);
    }
  };

  return (
    <section>
      <h1 className="dashboard-title">Extract Payslips</h1>
      <p className="extract-subtitle">Upload payslip PDFs — AI will extract all salary fields automatically</p>

      <div
        className={`upload-zone ${dragging ? 'dragging' : ''} ${processing ? 'disabled' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!processing) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !processing && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="upload-icon">☁️</div>
        <h3>Drag & drop payslip PDFs here</h3>
        <p>or click to browse — PDF and images supported</p>
        <button type="button" className="browse-btn" disabled={processing}>Browse Files</button>
        <div className="badge-row">
          <span className="file-badge">PDF</span>
          <span className="file-badge">JPG</span>
          <span className="file-badge">PNG</span>
        </div>
        <small>Max 10MB per file</small>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          multiple
          hidden
          disabled={processing}
          onChange={(event) => {
            if (event.target.files?.length) {
              addFiles(event.target.files);
              event.target.value = '';
            }
          }}
        />
      </div>

      {files.length > 0 ? (
        <div className="table-card file-list-card">
          <p className="files-count">{files.length} files selected ({files.length} payslips)</p>
          <div className="file-list">
            {files.map((selected) => (
              <div key={selected.id} className={`file-row ${selected.status === 'failed' ? 'failed' : ''}`}>
                <span className="file-icon">📄</span>
                <span className="file-name">{selected.file.name}</span>
                <span className="file-size">{formatSize(selected.file.size)}</span>
                {selected.error ? <span className="file-error">{selected.error}</span> : null}
                <button type="button" onClick={() => removeFile(selected.id)} disabled={processing} className="remove-file">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button className="extract-btn" onClick={handleExtract} disabled={processing || files.length === 0} type="button">
        {processing ? 'Extracting...' : 'Extract with AI →'}
      </button>
      <p className="extract-meta">~8 seconds per payslip • Powered by Claude AI</p>
      <p className="extract-meta">
        This will use {totalCreditsUsed} credits
        {creditsRemaining !== null ? ` (You have ${creditsRemaining} remaining)` : ''}
      </p>

      {processing ? (
        <div className="processing-card">
          <div className="spinner" />
          <p>AI is reading your payslips...</p>
          <p>Processing file {Math.min(currentFileIndex || 1, files.length)} of {files.length}...</p>
          <div className="usage-bar"><span style={{ width: `${progressPercent}%` }} /></div>
        </div>
      ) : null}

      {statusMessage ? <p className="success">{statusMessage}</p> : null}
      {generalError ? <p className="error">{generalError}</p> : null}
    </section>
  );
}
