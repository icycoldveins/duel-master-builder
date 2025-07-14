create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create unique index if not exists profiles_username_idx on public.profiles(username);
