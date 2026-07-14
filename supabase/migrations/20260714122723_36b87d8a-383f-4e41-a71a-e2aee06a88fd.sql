GRANT EXECUTE ON FUNCTION public.is_household_member(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid, text) TO authenticated, anon, service_role;