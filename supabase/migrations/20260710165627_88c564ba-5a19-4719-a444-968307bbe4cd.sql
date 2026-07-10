
-- calendar_integrations: per-user Google Calendar (extensible to other providers)
CREATE TABLE public.calendar_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'google',
  provider_account_email text,
  access_token_ciphertext text,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  calendar_ids text[] NOT NULL DEFAULT '{}',
  scopes text,
  last_synced_at timestamptz,
  sync_status text NOT NULL DEFAULT 'pending',
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, provider_account_email)
);
CREATE INDEX idx_calendar_integrations_user ON public.calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_household ON public.calendar_integrations(household_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_integrations TO authenticated;
GRANT ALL ON public.calendar_integrations TO service_role;

ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calendar integrations"
  ON public.calendar_integrations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_calendar_integrations_updated_at
  BEFORE UPDATE ON public.calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- phone_numbers: SMS opt-in
CREATE TABLE public.phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  e164 text NOT NULL,
  verified_at timestamptz,
  sms_opt_in boolean NOT NULL DEFAULT false,
  verification_code text,
  verification_expires_at timestamptz,
  verification_attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, e164)
);
CREATE INDEX idx_phone_numbers_user ON public.phone_numbers(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_numbers TO authenticated;
GRANT ALL ON public.phone_numbers TO service_role;

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own phone numbers"
  ON public.phone_numbers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- calendar_events: sync provenance
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS external_calendar_id text,
  ADD COLUMN IF NOT EXISTS synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uq_calendar_events_external
  ON public.calendar_events(household_id, source, external_id)
  WHERE external_id IS NOT NULL;


-- households: inbound email address
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS inbound_email text UNIQUE;


-- profiles: email delivery toggle
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean NOT NULL DEFAULT false;
