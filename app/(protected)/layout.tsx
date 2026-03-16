import AuthGuard from '@/app/components/AuthGuard';
import ProtectedShell from '@/app/components/ProtectedShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ProtectedShell>{children}</ProtectedShell>
    </AuthGuard>
  );
}
