-- School items
CREATE TABLE public.school_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  kid_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('tuition','homework','event','email_summary','permission_slip','other')),
  title text NOT NULL,
  detail text,
  due_at timestamptz,
  amount_cents integer,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','archived')),
  source text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_items TO authenticated;
GRANT ALL ON public.school_items TO service_role;
ALTER TABLE public.school_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_items select" ON public.school_items FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "school_items insert" ON public.school_items FOR INSERT TO authenticated
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "school_items update" ON public.school_items FOR UPDATE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id))
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "school_items delete" ON public.school_items FOR DELETE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_school_items_updated BEFORE UPDATE ON public.school_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_school_items_household ON public.school_items(household_id, due_at);

-- Sport teams
CREATE TABLE public.sport_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  kid_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  sport text NOT NULL,
  team_name text,
  season text,
  ranking text,
  coach_contact text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sport_teams TO authenticated;
GRANT ALL ON public.sport_teams TO service_role;
ALTER TABLE public.sport_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sport_teams select" ON public.sport_teams FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_teams insert" ON public.sport_teams FOR INSERT TO authenticated
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_teams update" ON public.sport_teams FOR UPDATE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id))
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_teams delete" ON public.sport_teams FOR DELETE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_sport_teams_updated BEFORE UPDATE ON public.sport_teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_sport_teams_household ON public.sport_teams(household_id);

-- Sport events
CREATE TABLE public.sport_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.sport_teams(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('practice','game','tournament','other')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  weather_note text,
  equipment_note text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','done','canceled')),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sport_events TO authenticated;
GRANT ALL ON public.sport_events TO service_role;
ALTER TABLE public.sport_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sport_events select" ON public.sport_events FOR SELECT TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_events insert" ON public.sport_events FOR INSERT TO authenticated
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_events update" ON public.sport_events FOR UPDATE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id))
  WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "sport_events delete" ON public.sport_events FOR DELETE TO authenticated
  USING (public.is_household_member(auth.uid(), household_id));
CREATE TRIGGER trg_sport_events_updated BEFORE UPDATE ON public.sport_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_sport_events_household ON public.sport_events(household_id, starts_at);
CREATE INDEX idx_sport_events_team ON public.sport_events(team_id, starts_at);