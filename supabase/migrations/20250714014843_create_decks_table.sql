create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  main_deck jsonb,
  extra_deck jsonb,
  side_deck jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
