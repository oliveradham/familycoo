
CREATE TABLE public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name text NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.meal_plan_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('breakfast','lunch','dinner')),
  meal_id uuid NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, plan_date, slot)
);
CREATE TABLE public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.family_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL DEFAULT 'Other',
  due_date date NOT NULL,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.family_members(id) ON DELETE CASCADE,
  person_label text NOT NULL DEFAULT 'Everyone',
  template text NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.packing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.packing_lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  packed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.birthdays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name text NOT NULL,
  relation text,
  birth_date date NOT NULL,
  gift_ideas text[] NOT NULL DEFAULT '{}',
  gift_status text NOT NULL DEFAULT 'idea' CHECK (gift_status IN ('idea','purchased','wrapped')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.chores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  stars int NOT NULL DEFAULT 1 CHECK (stars BETWEEN 1 AND 10),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.chore_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  chore_id uuid NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  stars int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  completed_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['meals','meal_plan_entries','homework','packing_lists','packing_items','birthdays','chores','chore_completions'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "household select" ON public.%I FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id))', t);
    EXECUTE format('CREATE POLICY "household insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id))', t);
    EXECUTE format('CREATE POLICY "household update" ON public.%I FOR UPDATE TO authenticated USING (public.is_household_member(auth.uid(), household_id)) WITH CHECK (public.is_household_member(auth.uid(), household_id))', t);
    EXECUTE format('CREATE POLICY "household delete" ON public.%I FOR DELETE TO authenticated USING (public.is_household_member(auth.uid(), household_id))', t);
    EXECUTE format('CREATE INDEX ON public.%I (household_id)', t);
  END LOOP;
END $$;

-- Birthday reminders: 14 and 3 days before, into each household member's notifications
CREATE OR REPLACE FUNCTION public.queue_birthday_reminders()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; nb date; days int; ref text;
BEGIN
  FOR r IN SELECT * FROM public.birthdays LOOP
    nb := make_date(extract(year from current_date)::int, extract(month from r.birth_date)::int,
                    LEAST(extract(day from r.birth_date)::int, 28 + CASE WHEN extract(month from r.birth_date)=2 THEN 0 ELSE 3 END));
    IF nb < current_date THEN nb := (nb + interval '1 year')::date; END IF;
    days := nb - current_date;
    IF days IN (14, 3) THEN
      ref := 'birthday:' || r.id || ':' || nb || ':' || days;
      INSERT INTO public.notification_log (user_id, household_id, channel, kind, subject, body, ref_id, delivered_at)
      SELECT hm.user_id, r.household_id, 'in_app', 'birthday_reminder',
             r.name || '''s birthday in ' || days || ' days',
             r.name || ' turns ' || (extract(year from nb)::int - extract(year from r.birth_date)::int) || ' on ' || to_char(nb, 'Mon DD') || '. Gift status: ' || r.gift_status || '.',
             ref, now()
      FROM public.household_members hm
      WHERE hm.household_id = r.household_id
        AND NOT EXISTS (SELECT 1 FROM public.notification_log n WHERE n.ref_id = ref AND n.user_id = hm.user_id);
    END IF;
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.queue_birthday_reminders() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('birthday-reminders-daily', '0 13 * * *', $$SELECT public.queue_birthday_reminders();$$);
