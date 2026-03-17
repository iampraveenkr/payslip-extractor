import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type InputFile = {
  name: string;
  type: string;
  size: number;
  base64: string;
};

const SYSTEM_PROMPT = `You are a payslip data extraction expert. Extract ALL salary information from this payslip document. Return ONLY a valid JSON object with these exact fields (use null if field not found):
{
  employee_name: string,
  employee_id: string,
  designation: string,
  department: string,
  company_name: string,
  month_year: string,
  basic_salary: number,
  hra: number,
  special_allowance: number,
  other_allowances: number,
  gross_salary: number,
  pf_employee: number,
  pf_employer: number,
  esic: number,
  professional_tax: number,
  tds: number,
  other_deductions: number,
  total_deductions: number,
  net_pay: number,
  bank_account_last4: string,
  pan_last4: string,
  confidence_score: number (0-100, your confidence in extraction)
}
Return ONLY the JSON. No explanation. No markdown.`;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function parseClaudeJson(raw: string) {
  const trimmed = raw.trim();
  const noCodeFence = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const first = noCodeFence.indexOf('{');
  const last = noCodeFence.lastIndexOf('}');
  const jsonSlice = first >= 0 && last >= 0 ? noCodeFence.slice(first, last + 1) : noCodeFence;
  return JSON.parse(jsonSlice);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mockExtractionForFile(fileName: string) {
  return {
    employee_name: 'Mock Employee',
    employee_id: 'EMP-001',
    designation: 'Software Engineer',
    department: 'Engineering',
    company_name: 'PayslipIQ',
    month_year: 'Mar-2026',
    basic_salary: 45000,
    hra: 18000,
    special_allowance: 8000,
    other_allowances: 2000,
    gross_salary: 73000,
    pf_employee: 1800,
    pf_employer: 1800,
    esic: 0,
    professional_tax: 200,
    tds: 1500,
    other_deductions: 0,
    total_deductions: 3500,
    net_pay: 69500,
    bank_account_last4: '1234',
    pan_last4: '1F2G',
    confidence_score: 72,
    source_file: fileName,
    extraction_mode: 'mock',
  };
}

async function extractWithClaude(file: InputFile, anthropicApiKey: string) {
  const contentBlock = file.type === 'application/pdf'
    ? {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: file.base64 },
      }
    : {
        type: 'image',
        source: { type: 'base64', media_type: file.type || 'image/png', data: file.base64 },
      };

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [contentBlock, { type: 'text', text: 'Extract the payslip fields now.' }],
        },
      ],
    }),
  });

  if (!claudeRes.ok) {
    const errBody = await claudeRes.text();
    throw new Error(`Claude request failed: ${errBody}`);
  }

  const claudeData = await claudeRes.json() as { content?: Array<{ type?: string; text?: string }> };
  const textBlock = claudeData.content?.find((item) => item.type === 'text')?.text;
  if (!textBlock) {
    throw new Error('Claude returned no text response.');
  }

  return parseClaudeJson(textBlock);
}

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const useMock = process.env.USE_MOCK_EXTRACTION === 'true' || !anthropicApiKey;

    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.' }, { status: 500 });
    }

    const body = await req.json();
    const files = (body?.files || []) as InputFile[];

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    if (useMock) {
      const extractionId = `mock_${Date.now()}`;
      const results = files.map((file) => ({
        file_name: file.name,
        file_size: formatBytes(file.size),
        storage_path: null,
        status: 'Completed',
        extracted_data: mockExtractionForFile(file.name),
      }));

      return NextResponse.json({
        extractionId,
        total: files.length,
        successCount: files.length,
        failedCount: 0,
        message: `${files.length} of ${files.length} payslips extracted successfully`,
        results,
        extractionMode: 'mock-local',
      });
    }

    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid auth token.' }, { status: 401 });
    }

    const fileNames = files.map((file) => file.name);
    const { data: extractionRow, error: extractionError } = await userClient
      .from('extractions')
      .insert({ user_id: user.id, file_names: fileNames, payslip_count: files.length, status: 'Processing', result_json: [] })
      .select('id')
      .single();

    if (extractionError || !extractionRow) {
      return NextResponse.json({ error: extractionError?.message || 'Could not create extraction row.' }, { status: 500 });
    }

    const results: Array<Record<string, unknown>> = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const safeName = sanitizeFileName(file.name);
      const path = `${user.id}/${Date.now()}-${i}-${safeName}`;

      try {
        const binary = Buffer.from(file.base64, 'base64');
        const { error: uploadError } = await userClient.storage.from('payslips').upload(path, binary, {
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const parsed = await extractWithClaude(file, anthropicApiKey as string);

        results.push({
          file_name: file.name,
          file_size: formatBytes(file.size),
          storage_path: path,
          status: 'Completed',
          extracted_data: parsed,
        });
        successCount += 1;
      } catch (error) {
        results.push({
          file_name: file.name,
          file_size: formatBytes(file.size),
          status: 'Failed',
          error: error instanceof Error ? error.message : 'Unknown extraction error',
        });
      }
    }

    const finalStatus = successCount > 0 ? 'Completed' : 'Failed';

    await userClient.from('extractions').update({ status: finalStatus, result_json: results }).eq('id', extractionRow.id);

    if (successCount > 0) {
      const { data: profileRow } = await userClient.from('users_profile').select('credits_used').eq('id', user.id).single();
      const creditsUsed = profileRow?.credits_used || 0;
      await userClient.from('users_profile').update({ credits_used: creditsUsed + successCount }).eq('id', user.id);
    }

    return NextResponse.json({
      extractionId: extractionRow.id,
      total: files.length,
      successCount,
      failedCount: files.length - successCount,
      message: `${successCount} of ${files.length} payslips extracted successfully`,
      results,
      extractionMode: 'claude',
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected server error' }, { status: 500 });
  }
}
