revoke execute on function public.has_active_subscription(uuid, text) from public, anon, authenticated;
revoke execute on function public.get_user_tier(uuid, text) from public, anon, authenticated;
grant execute on function public.has_active_subscription(uuid, text) to service_role;
grant execute on function public.get_user_tier(uuid, text) to service_role;
