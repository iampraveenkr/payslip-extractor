# PayslipIQ Supabase Auth + Dashboard Setup

## 1) Add your Supabase credentials

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Create database tables

Run these SQL files in your Supabase SQL editor:

- `supabase/users_profile.sql`
- `supabase/extractions.sql`

## 3) Start the app

```bash
npm run dev
```

Pages:
- `/signup`
- `/login`
- `/forgot-password`
- `/dashboard` (protected)
- `/extract`, `/history`, `/api-access`, `/billing`, `/settings` (protected)
