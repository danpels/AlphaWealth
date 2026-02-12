# AlphaWealth

Household finance and investing app: track income, spending, and projections with a minimalist, luxury UI.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style components
- **Backend & Auth:** Supabase
- **Charts:** Recharts
- **Deploy:** Vercel (free tier)

## Features

- **Onboarding:** Slide-by-slide questionnaire (paycheck, pay frequency, emergency fund, travel budget, credit card debt, investment/retirement goal, travel goal, house savings, currency & region)
- **Dashboard:** Income and balance summary; savings goals bar chart; savings vs income projection (inflation-aware)
- **Accounts:** CRUD for checking, savings, investment, retirement, futures, other
- **Income sources:** Primary, spouse, side income with amount, frequency, and optional growth rate
- **Recurring expenses:** Add and view recurring expenses with frequency
- **Calendar spending view:** Monthly calendar with spending by day
- **Invest:** ETF-style projections (VOO, VTI, SCHD, VYM) with dividend yield and growth; goal tracking
- **Tools:** Currency converter (USD/CAD live rate), tax calculator (US states + Canadian provinces), link to North America cost of living (Numbeo), recurring expenses, income sources

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/AlphaWealth.git
cd AlphaWealth
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration: copy and run the contents of `supabase/migrations/001_initial_schema.sql`.
3. In **Authentication → URL Configuration**, set:
   - **Site URL:** `https://your-vercel-url.vercel.app` (or `http://localhost:3000` for local)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` and `https://your-vercel-url.vercel.app/auth/callback`.

### 3. Environment variables

Copy the example env and fill in your Supabase keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (free)

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel will use the build command `next build` from `package.json`.
5. In Supabase **Authentication → URL Configuration**, set **Site URL** and **Redirect URLs** to your Vercel URL (e.g. `https://alphawealth.vercel.app` and `https://alphawealth.vercel.app/auth/callback`).

## Project structure

- `src/app/` — App Router pages (landing, auth, onboarding, app dashboard, accounts, calendar, invest, tools)
- `src/components/` — UI components and feature components (dashboard, accounts, calendar, invest, tools)
- `src/lib/` — Supabase client, server, middleware; utils
- `src/config/` — Onboarding slides, currencies, regions
- `src/types/` — Database types
- `supabase/migrations/` — SQL schema and RLS

## License

MIT
