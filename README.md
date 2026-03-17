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
- `ANTHROPIC_API_KEY`

> If these variables are missing, the app now shows a clear in-app configuration notice instead of crashing.

## 3) Create database tables

Run these SQL files in your Supabase SQL editor:

- `supabase/users_profile.sql`
- `supabase/extractions.sql`
- `supabase/storage_payslips.sql`

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
- `/results/:id` (protected)

## Merge landing page branch into the single SaaS app

You mentioned this branch name:

- `codex/build-payslipiq-landing-page`

To combine everything into one app, merge that branch into `work`.

### If the branch is already local

```bash
git checkout work
git merge codex/build-payslipiq-landing-page
```

### If the branch exists on remote only

```bash
git fetch origin codex/build-payslipiq-landing-page:codex/build-payslipiq-landing-page
git checkout work
git merge codex/build-payslipiq-landing-page
```

Or use the helper script:

```bash
./scripts/merge-landing-branch.sh
```

After merge:

```bash
npm run lint
npm run build
```

If there are conflicts, resolve them, commit, and run the two checks again.
