
select cron.schedule(
  'familycoo-sync-calendars',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://familycoo.lovable.app/api/public/hooks/sync-calendars',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_PUBLISHABLE_KEY' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
