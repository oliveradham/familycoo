
-- Memory
CREATE TABLE public.family_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  fact text NOT NULL,
  source text NOT NULL DEFAULT 'user',
  confidence numeric NOT NULL DEFAULT 1.0,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_memory TO authenticated;
GRANT ALL ON public.family_memory TO service_role;
ALTER TABLE public.family_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hh members read memory" ON public.family_memory FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "hh members write memory" ON public.family_memory FOR INSERT TO authenticated
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "hh members update memory" ON public.family_memory FOR UPDATE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id))
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "hh members delete memory" ON public.family_memory FOR DELETE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_family_memory_updated BEFORE UPDATE ON public.family_memory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_family_memory_hh ON public.family_memory(household_id);

-- Concierge messages
CREATE TABLE public.concierge_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.concierge_messages TO authenticated;
GRANT ALL ON public.concierge_messages TO service_role;
ALTER TABLE public.concierge_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own concierge read" ON public.concierge_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "own concierge insert" ON public.concierge_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_household_member(auth.uid(), household_id));
CREATE POLICY "own concierge delete" ON public.concierge_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX idx_concierge_msgs_user ON public.concierge_messages(user_id, created_at);

-- Notification prefs
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS morning_briefing_at time DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS afternoon_check_in_at time DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS evening_wrap_at time DEFAULT '20:30',
  ADD COLUMN IF NOT EXISTS notification_channel text NOT NULL DEFAULT 'push';
