-- StudyBeam Mission 2: review before applying. Do NOT run on production automatically.
create table if not exists public.student_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (char_length(display_name) <= 50),
 grade text not null default '' check (char_length(grade) <= 80),
 updated_at timestamptz not null default now()
);
create table if not exists public.learning_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 chapter_id text not null check (chapter_id ~ '^[a-z0-9-]{1,120}$'),
 last_opened_at timestamptz not null default now(),
 status text not null default 'opened' check (status in ('opened','completed')),
 updated_at timestamptz not null default now(),
 primary key (user_id,chapter_id)
);
create index if not exists learning_progress_recent_idx on public.learning_progress (user_id,last_opened_at desc);
alter table public.student_profiles enable row level security;
alter table public.learning_progress enable row level security;
revoke all on public.student_profiles, public.learning_progress from anon;
grant select,insert,update,delete on public.student_profiles,public.learning_progress to authenticated;
create policy "profile owner read" on public.student_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profile owner insert" on public.student_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profile owner update" on public.student_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profile owner delete" on public.student_profiles for delete to authenticated using ((select auth.uid()) = user_id);
create policy "progress owner read" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress owner insert" on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress owner update" on public.learning_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress owner delete" on public.learning_progress for delete to authenticated using ((select auth.uid()) = user_id);
