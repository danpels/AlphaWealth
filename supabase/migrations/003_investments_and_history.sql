-- Investment holdings (track actual portfolio positions)
create table if not exists public.investment_holdings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  ticker text not null,
  name text,
  shares numeric not null default 0,
  cost_basis numeric not null default 0,
  asset_type text default 'ETF' check (asset_type in ('ETF', 'Stock', 'Bond', 'Crypto', 'REIT', 'Other')),
  dividend_yield_percent numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.investment_holdings enable row level security;
create policy "Users can crud own investment_holdings" on public.investment_holdings for all using (auth.uid() = user_id);

-- Account snapshots (for tracking net worth history over time)
create table if not exists public.account_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  balance numeric not null,
  snapshot_date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.account_snapshots enable row level security;
create policy "Users can crud own account_snapshots" on public.account_snapshots for all using (auth.uid() = user_id);

-- Add index for efficient date-based queries
create index if not exists idx_account_snapshots_date on public.account_snapshots(user_id, snapshot_date);
create index if not exists idx_account_snapshots_account on public.account_snapshots(account_id, snapshot_date);

-- Update user_goals table to add icon and color
alter table public.user_goals add column if not exists icon text default 'target';
alter table public.user_goals add column if not exists color text default 'hsl(var(--chart-1))';
alter table public.user_goals add column if not exists priority integer default 0;

-- Tax settings table for user-specific tax configuration
create table if not exists public.tax_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  filing_status text default 'single' check (filing_status in ('single', 'married_joint', 'married_separate', 'head_of_household')),
  rrsp_contribution numeric default 0,
  tfsa_contribution numeric default 0,
  fhsa_contribution numeric default 0,
  retirement_401k_contribution numeric default 0,
  ira_contribution numeric default 0,
  hsa_contribution numeric default 0,
  standard_deduction_override numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tax_settings enable row level security;
create policy "Users can crud own tax_settings" on public.tax_settings for all using (auth.uid() = user_id);

-- Investment settings (monthly contribution, risk profile, etc.)
create table if not exists public.investment_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  monthly_contribution numeric default 0,
  risk_profile text default 'moderate' check (risk_profile in ('conservative', 'moderate', 'aggressive')),
  projection_years integer default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.investment_settings enable row level security;
create policy "Users can crud own investment_settings" on public.investment_settings for all using (auth.uid() = user_id);

-- Add category to recurring_expenses if not exists
alter table public.recurring_expenses add column if not exists category text;
