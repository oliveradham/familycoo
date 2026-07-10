-- 1. Weekly reviews table
CREATE TABLE public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  headline text NOT NULL,
  summary text NOT NULL,
  wins jsonb NOT NULL DEFAULT '[]'::jsonb,
  upcoming jsonb NOT NULL DEFAULT '[]'::jsonb,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can read weekly reviews"
  ON public.weekly_reviews FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));

CREATE TRIGGER weekly_reviews_updated_at
  BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX weekly_reviews_household_week_idx
  ON public.weekly_reviews (household_id, week_start DESC);

-- 2. notification_log: read state + dedupe key
ALTER TABLE public.notification_log
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS ref_id text;

CREATE INDEX IF NOT EXISTS notification_log_user_created_idx
  ON public.notification_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notification_log_dedupe_idx
  ON public.notification_log (household_id, ref_id, created_at DESC)
  WHERE ref_id IS NOT NULL;

-- Allow a user to mark their own notifications as read
CREATE POLICY "Users can update own notification read state"
  ON public.notification_log FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own notifications"
  ON public.notification_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. push_subscriptions platform column
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'web'
  CHECK (platform IN ('web', 'ios', 'android'));