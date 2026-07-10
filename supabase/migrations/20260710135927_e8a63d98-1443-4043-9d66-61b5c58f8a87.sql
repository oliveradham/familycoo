
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text default 'en',
  timezone text default 'America/Los_Angeles',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Households
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Household',
  city text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.households to authenticated;
grant all on public.households to service_role;
alter table public.households enable row level security;

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);
grant select, insert, update, delete on public.household_members to authenticated;
grant all on public.household_members to service_role;
alter table public.household_members enable row level security;

-- Security definer to avoid recursive RLS between households and members
create or replace function public.is_household_member(_user_id uuid, _household_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.household_members where user_id = _user_id and household_id = _household_id)
$$;

create policy "read own households" on public.households for select to authenticated
  using (public.is_household_member(auth.uid(), id));
create policy "update own households" on public.households for update to authenticated
  using (public.is_household_member(auth.uid(), id)) with check (public.is_household_member(auth.uid(), id));
create policy "insert own households" on public.households for insert to authenticated
  with check (auth.uid() = created_by);

create policy "read own memberships" on public.household_members for select to authenticated
  using (user_id = auth.uid() or public.is_household_member(auth.uid(), household_id));
create policy "insert own memberships" on public.household_members for insert to authenticated
  with check (user_id = auth.uid());

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger households_updated before update on public.households for each row execute function public.set_updated_at();

-- Signup trigger: create profile + household + owner membership + user role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_household_id uuid;
  disp text;
begin
  disp := coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, display_name) values (new.id, disp);

  insert into public.households (name, created_by) values (coalesce(disp, 'My') || '''s Household', new.id)
  returning id into new_household_id;

  insert into public.household_members (household_id, user_id, member_role) values (new_household_id, new.id, 'owner');

  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;

  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
