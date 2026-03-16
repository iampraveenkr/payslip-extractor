export default function SupabaseConfigNotice() {
  return (
    <div className="error-card" role="alert">
      <h2>Supabase is not configured</h2>
      <p>
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>,
        then restart the app.
      </p>
    </div>
  );
}
