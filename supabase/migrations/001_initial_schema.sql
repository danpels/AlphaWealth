-- AlphaWealth: profiles + onboarding + financial data
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'USD' check (currency in ('USD', 'CAD')),
  region text, -- US state code or Canadian province code for tax
  onboarding_completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Onboarding answers (one row per user, all questionnaire fields)
create table public.onboarding (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  average_paycheck numeric,
  hourly_rate numeric,
  pay_frequency text check (pay_frequency in ('weekly', 'biweekly', 'monthly', 'annual')),
  emergency_fund numeric,
  travel_budget_goal numeric,
  credit_card_debt numeric,
  investment_retirement_goal numeric,
  travel_goal numeric,
  house_savings_goal numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Income sources (user + spouse + side income)
create table public.income_sources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('primary', 'spouse', 'side', 'other')),
  amount numeric not null,
  frequency text default 'monthly' check (frequency in ('weekly', 'biweekly', 'monthly', 'annual')),
  growth_rate_percent numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Account types (checking, savings, investment, etc.)
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'investment', 'retirement', 'futures', 'other')),
  balance numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recurring expenses
create table public.recurring_expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  amount numeric not null,
  frequency text default 'monthly' check (frequency in ('weekly', 'biweekly', 'monthly', 'annual')),
  next_due date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transactions (for calendar / spending view)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text,
  description text,
  date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.income_sources enable row level security;
alter table public.accounts enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.transactions enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can crud own onboarding" on public.onboarding for all using (auth.uid() = user_id);
create policy "Users can crud own income_sources" on public.income_sources for all using (auth.uid() = user_id);
create policy "Users can crud own accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "Users can crud own recurring_expenses" on public.recurring_expenses for all using (auth.uid() = user_id);
create policy "Users can crud own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
