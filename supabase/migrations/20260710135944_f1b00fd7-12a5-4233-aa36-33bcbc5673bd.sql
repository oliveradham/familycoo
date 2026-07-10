
-- Ensure updated_at has fixed search_path
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

-- Revoke execute from anon/authenticated on security definer helpers.
-- has_role and is_household_member are called only from RLS policies (which run as the row owner),
-- and handle_new_user is only invoked by the auth.users trigger, so no direct client access is needed.
revoke execute on function public.has_role(uuid, app_role) from public, anon, authenticated;
revoke execute on function public.is_household_member(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
