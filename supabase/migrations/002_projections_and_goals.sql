-- Projection preferences (target age, target net worth for "Project your success")
create table if not exists public.projection_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  current_age integer,
  target_age integer default 90,
  target_net_worth numeric,
  monthly_savings numeric,
  assumed_real_return_percent numeric default 4.5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projection_settings enable row level security;
create policy "Users can crud own projection_settings" on public.projection_settings for all using (auth.uid() = user_id);

-- User-defined goals (optional override; onboarding still drives defaults)
create table if not exists public.user_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null,
  current_saved numeric default 0,
  target_date date,
  monthly_contribution numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_goals enable row level security;
create policy "Users can crud own user_goals" on public.user_goals for all using (auth.uid() = user_id);

-- Budget limits per category (optional)
create table if not exists public.budget_limits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  monthly_limit numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, category)
);

alter table public.budget_limits enable row level security;
create policy "Users can crud own budget_limits" on public.budget_limits for all using (auth.uid() = user_id);
