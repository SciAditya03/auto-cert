create extension if not exists "pgcrypto";

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  name text not null,
  eligible boolean not null default true
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null,
  name text not null,
  eligible boolean not null default true
);

create table if not exists public.certificate_logs (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null,
  certificate_type text not null check (certificate_type in ('PARTICIPATION', 'ACHIEVEMENT')),
  generated_at timestamptz not null default now()
);

create index if not exists achievements_registration_number_idx
  on public.achievements (registration_number);

create index if not exists certificate_logs_registration_number_idx
  on public.certificate_logs (registration_number);

-- The server uses the Supabase service-role key, so these tables can stay
-- inaccessible from the browser. Do NOT expose the service-role key publicly.
alter table public.participants enable row level security;
alter table public.achievements enable row level security;
alter table public.certificate_logs enable row level security;
