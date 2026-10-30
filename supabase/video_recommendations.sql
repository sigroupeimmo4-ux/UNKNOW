-- StudyBeam: vidéo recommandations 2026–2027, modération stricte.
create table if not exists public.studybeam_videos (
 id uuid primary key default gen_random_uuid(),
 provider text not null default 'youtube' check(provider in ('youtube','manual')),
 provider_video_id text,
 url text not null check (url ~ '^https://'),
 title text not null check (length(title) between 3 and 250),
 channel text not null default '',
 duration_seconds integer check (duration_seconds between 0 and 43200),
 description text not null default '',
 language text not null default 'fr',
 grade text not null,
 pathway text not null,
 subject_id text not null,
 chapter_id text not null,
 school_year text not null default '2026-2027',
 source text not null default '',
 relevance_score numeric(4,3) check(relevance_score between 0 and 1),
 accuracy_notes text not null default '',
 status text not null default 'pending' check (status in ('pending','approved','rejected','unavailable')),
 availability_checked_at timestamptz,
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(provider,provider_video_id,grade,pathway,subject_id,chapter_id,school_year)
);
create index if not exists studybeam_videos_lookup on public.studybeam_videos(school_year,grade,pathway,subject_id,chapter_id,status);
create table if not exists public.studybeam_video_search_cache (
 id uuid primary key default gen_random_uuid(),
 grade text not null, pathway text not null, subject_id text not null, chapter_id text not null,
 school_year text not null default '2026-2027',
 provider text not null default 'youtube',
 searched_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '14 days'),
 result_count integer not null default 0,
 error_message text,
 unique(grade,pathway,subject_id,chapter_id,school_year,provider)
);
alter table public.studybeam_videos enable row level security;
alter table public.studybeam_video_search_cache enable row level security;
revoke all on public.studybeam_videos from anon,authenticated;
revoke all on public.studybeam_video_search_cache from anon,authenticated;
grant select on public.studybeam_videos to anon,authenticated;
grant insert,update,delete on public.studybeam_videos to authenticated;
grant select on public.studybeam_video_search_cache to authenticated;
create policy "videos_public_approved" on public.studybeam_videos
 for select to anon,authenticated using(status='approved');
create policy "videos_admin_read" on public.studybeam_videos
 for select to authenticated using(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin');
create policy "videos_admin_insert" on public.studybeam_videos
 for insert to authenticated with check(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin');
create policy "videos_admin_update" on public.studybeam_videos
 for update to authenticated using(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin')
 with check(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin');
create policy "videos_admin_delete" on public.studybeam_videos
 for delete to authenticated using(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin');
create policy "search_cache_admin_read" on public.studybeam_video_search_cache
 for select to authenticated using(coalesce((select auth.jwt())->'app_metadata'->>'studybeam_role','')='admin');
-- Automated searches should run server-side with a secret service key; browser clients cannot write the cache.
