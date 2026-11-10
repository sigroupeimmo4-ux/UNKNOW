-- Quota quotidien de l'assistant Beam : compteur par utilisateur et plafond global (UTC).
create table if not exists public.beam_usage (
  user_id uuid not null,
  day date not null default ((now() at time zone 'utc')::date),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);
alter table public.beam_usage enable row level security;
revoke all on public.beam_usage from anon, authenticated;

create or replace function public.beam_register_use(p_user uuid, p_user_limit integer, p_global_limit integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
  gid uuid := '00000000-0000-0000-0000-000000000000';
  g integer;
  u integer;
begin
  insert into public.beam_usage as b (user_id, day, count) values (gid, today, 1)
    on conflict (user_id, day) do update set count = b.count + 1 where b.count < p_global_limit
    returning b.count into g;
  if g is null then return 'global_limit'; end if;

  insert into public.beam_usage as b (user_id, day, count) values (p_user, today, 1)
    on conflict (user_id, day) do update set count = b.count + 1 where b.count < p_user_limit
    returning b.count into u;
  if u is null then
    update public.beam_usage set count = count - 1 where user_id = gid and day = today;
    return 'user_limit';
  end if;
  return 'ok';
end;
$$;
revoke all on function public.beam_register_use(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.beam_register_use(uuid, integer, integer) to service_role;
