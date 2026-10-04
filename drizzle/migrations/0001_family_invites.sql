CREATE TABLE public.family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  max_uses integer NOT NULL DEFAULT 5,
  use_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX family_invites_household_idx ON public.family_invites(household_id);

GRANT SELECT ON public.family_invites TO authenticated;
GRANT ALL ON public.family_invites TO service_role;

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view household invites" ON public.family_invites
FOR SELECT TO authenticated USING (public.is_household_member(auth.uid(), household_id));

CREATE OR REPLACE FUNCTION public.create_family_invite()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _hid uuid;
  _code text;
  _alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  _row public.family_invites;
  i int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT household_id INTO _hid FROM public.household_members
    WHERE user_id = _uid AND member_role IN ('owner','admin')
    ORDER BY created_at LIMIT 1;
  IF _hid IS NULL THEN RETURN jsonb_build_object('status','not_organizer'); END IF;

  UPDATE public.family_invites SET expires_at = now()
    WHERE household_id = _hid AND expires_at > now();

  LOOP
    _code := '';
    FOR i IN 1..6 LOOP
      _code := _code || substr(_alphabet, 1 + floor(random() * length(_alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.family_invites WHERE code = _code);
  END LOOP;

  INSERT INTO public.family_invites (household_id, code, created_by)
    VALUES (_hid, _code, _uid) RETURNING * INTO _row;
  RETURN jsonb_build_object('status','ok','code',_row.code,'expires_at',_row.expires_at,
    'max_uses',_row.max_uses,'use_count',_row.use_count);
END $$;

CREATE OR REPLACE FUNCTION public.get_family_invite()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _hid uuid;
  _row public.family_invites;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT household_id INTO _hid FROM public.household_members
    WHERE user_id = _uid AND member_role IN ('owner','admin')
    ORDER BY created_at LIMIT 1;
  IF _hid IS NULL THEN RETURN jsonb_build_object('status','not_organizer'); END IF;
  SELECT * INTO _row FROM public.family_invites
    WHERE household_id = _hid AND expires_at > now() AND use_count < max_uses
    ORDER BY created_at DESC LIMIT 1;
  IF _row.id IS NULL THEN RETURN jsonb_build_object('status','none'); END IF;
  RETURN jsonb_build_object('status','ok','code',_row.code,'expires_at',_row.expires_at,
    'max_uses',_row.max_uses,'use_count',_row.use_count);
END $$;

CREATE OR REPLACE FUNCTION public.join_family(_code text, _leave_current boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _inv public.family_invites;
  _name text;
  _current_hid uuid;
  _current_name text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO _inv FROM public.family_invites
    WHERE code = upper(trim(coalesce(_code,''))) FOR UPDATE;
  IF _inv.id IS NULL THEN RETURN jsonb_build_object('status','invalid'); END IF;
  IF _inv.expires_at <= now() THEN RETURN jsonb_build_object('status','expired'); END IF;
  IF _inv.use_count >= _inv.max_uses THEN RETURN jsonb_build_object('status','used_up'); END IF;

  SELECT name INTO _name FROM public.households WHERE id = _inv.household_id;

  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = _uid AND household_id = _inv.household_id) THEN
    RETURN jsonb_build_object('status','already_member','family_name',_name);
  END IF;

  SELECT hm.household_id, h.name INTO _current_hid, _current_name
    FROM public.household_members hm JOIN public.households h ON h.id = hm.household_id
    WHERE hm.user_id = _uid ORDER BY hm.created_at LIMIT 1;

  IF _current_hid IS NOT NULL AND NOT _leave_current THEN
    RETURN jsonb_build_object('status','in_other_family','current_family',_current_name,'family_name',_name);
  END IF;

  IF _current_hid IS NOT NULL THEN
    DELETE FROM public.household_members WHERE user_id = _uid;
  END IF;

  INSERT INTO public.household_members (household_id, user_id, member_role)
    VALUES (_inv.household_id, _uid, 'member');
  UPDATE public.family_invites SET use_count = use_count + 1 WHERE id = _inv.id;
  RETURN jsonb_build_object('status','joined','family_name',_name);
END $$;

REVOKE EXECUTE ON FUNCTION public.create_family_invite() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_family_invite() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_family(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_family_invite() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_family_invite() TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_family(text, boolean) TO authenticated;