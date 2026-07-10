create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
      and environment = check_env
      and (
        (status in ('active', 'trialing', 'past_due') and (current_period_end is null or current_period_end > now()))
        or (status = 'canceled' and current_period_end is not null and current_period_end > now())
      )
  );
$$;

create or replace function public.get_user_tier(
  user_uuid uuid,
  check_env text default 'live'
)
returns text language sql security definer set search_path = public as $$
  select coalesce(
    (
      select case
        when product_id = 'family_coo_max' then 'max'
        when product_id = 'family_coo_pro' then 'pro'
        else 'free'
      end
      from public.subscriptions
      where user_id = user_uuid
        and environment = check_env
        and (
          (status in ('active', 'trialing', 'past_due') and (current_period_end is null or current_period_end > now()))
          or (status = 'canceled' and current_period_end is not null and current_period_end > now())
        )
      order by created_at desc
      limit 1
    ),
    'free'
  );
$$;

create index if not exists idx_subscriptions_user_env on public.subscriptions(user_id, environment, created_at desc);
