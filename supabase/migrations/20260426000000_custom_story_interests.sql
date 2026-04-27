create table custom_story_interests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table custom_story_interests enable row level security;

create policy "Users can read own interest"
  on custom_story_interests for select
  using (auth.uid() = user_id);

create policy "Users can register own interest"
  on custom_story_interests for insert
  with check (auth.uid() = user_id);
