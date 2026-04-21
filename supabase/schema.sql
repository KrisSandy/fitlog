-- ============================================
-- FitLog Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  created_at timestamptz default now() not null
);

-- 2. Workouts table (one row per logged workout)
create table public.workouts (
  id text primary key,                -- "workout-2026-04-21"
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  day_type text not null,             -- "push", "pull", "legs", "full", "custom"
  day_name text not null,             -- "Push", "Pull", etc.
  notes text default '',
  completed_at timestamptz,
  created_at timestamptz default now() not null,

  unique(user_id, date)               -- one workout per user per day
);

-- 3. Exercises within a workout
create table public.exercises (
  id bigint generated always as identity primary key,
  workout_id text references public.workouts(id) on delete cascade not null,
  name text not null,
  note text default '',
  is_custom boolean default false,
  sort_order int not null default 0
);

-- 4. Individual sets within an exercise
create table public.sets (
  id bigint generated always as identity primary key,
  exercise_id bigint references public.exercises(id) on delete cascade not null,
  set_number int not null,
  reps text not null,
  weight text not null default '',
  completed boolean default false
);

-- ============================================
-- Row Level Security — users can only see their own data
-- ============================================

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Workouts: users can CRUD their own workouts
create policy "Users can view own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Exercises: access through workout ownership
create policy "Users can view own exercises"
  on public.exercises for select
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can insert own exercises"
  on public.exercises for insert
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can update own exercises"
  on public.exercises for update
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can delete own exercises"
  on public.exercises for delete
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- Sets: access through exercise → workout ownership
create policy "Users can view own sets"
  on public.sets for select
  using (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can insert own sets"
  on public.sets for insert
  with check (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can update own sets"
  on public.sets for update
  using (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can delete own sets"
  on public.sets for delete
  using (
    exists (
      select 1 from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

-- ============================================
-- Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
