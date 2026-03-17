# PayslipIQ Supabase Auth + Dashboard Setup

## 1) Install dependencies

```bash
npm install
```

## 2) Add your Supabase credentials

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> If these variables are missing, the app now shows a clear in-app configuration notice instead of crashing.

## 3) Create database tables

Run these SQL files in your Supabase SQL editor:

- `supabase/users_profile.sql`
- `supabase/extractions.sql`

## 4) Start the app

```bash
npm run dev
```

Pages:
- `/signup`
- `/login`
- `/forgot-password`
- `/dashboard` (protected)
- `/extract`, `/history`, `/api-access`, `/billing`, `/settings` (protected)

## Branch strategy for one SaaS app

If you have another feature branch (for example a landing-page branch), keep it separate while developing, then merge it into `work` before release so everything ships as one SaaS application.

Quick merge flow:

```bash
git checkout work
git merge <landing-page-branch>
```

If there are conflicts, resolve them and re-run:

```bash
npm run lint
npm run build
```
