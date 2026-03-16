import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayslipIQ Auth',
  description: 'Supabase authentication setup for PayslipIQ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
