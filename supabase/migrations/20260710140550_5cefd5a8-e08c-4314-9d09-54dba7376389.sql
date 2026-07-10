
-- family_members
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'child',
  birth_date date,
  color text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read family_members" ON public.family_members FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members insert family_members" ON public.family_members FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members update family_members" ON public.family_members FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members delete family_members" ON public.family_members FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_family_members_updated BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- calendar_events
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  category text,
  member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read events" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members insert events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id) AND created_by = auth.uid());
CREATE POLICY "members update events" ON public.calendar_events FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members delete events" ON public.calendar_events FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE INDEX idx_events_household_start ON public.calendar_events(household_id, starts_at);
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  due_at timestamptz,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  category text,
  member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  assignee_user_id uuid,
  created_by uuid NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id) AND created_by = auth.uid());
CREATE POLICY "members update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE INDEX idx_tasks_household_status ON public.tasks(household_id, status, due_at);
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- inbox_items
CREATE TABLE public.inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'manual',
  sender text,
  subject text NOT NULL,
  summary text,
  lane text NOT NULL DEFAULT 'fyi',
  status text NOT NULL DEFAULT 'open',
  due_at timestamptz,
  amount numeric(12,2),
  member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  raw_content text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inbox_items TO authenticated;
GRANT ALL ON public.inbox_items TO service_role;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read inbox" ON public.inbox_items FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members insert inbox" ON public.inbox_items FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members update inbox" ON public.inbox_items FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members delete inbox" ON public.inbox_items FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE INDEX idx_inbox_household_lane ON public.inbox_items(household_id, lane, status);
CREATE TRIGGER trg_inbox_updated BEFORE UPDATE ON public.inbox_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- briefings
CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'morning',
  briefing_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  content jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, kind, briefing_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.briefings TO authenticated;
GRANT ALL ON public.briefings TO service_role;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read briefings" ON public.briefings FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members insert briefings" ON public.briefings FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members update briefings" ON public.briefings FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "members delete briefings" ON public.briefings FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_briefings_updated BEFORE UPDATE ON public.briefings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
