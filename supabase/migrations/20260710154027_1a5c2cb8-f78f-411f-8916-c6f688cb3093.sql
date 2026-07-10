
-- medical_records
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'note',
  title text NOT NULL,
  provider text,
  occurred_on date,
  next_due_on date,
  detail_enc text,
  policy_number_enc text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_records_select" ON public.medical_records FOR SELECT
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "medical_records_insert" ON public.medical_records FOR INSERT
  TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "medical_records_update" ON public.medical_records FOR UPDATE
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "medical_records_delete" ON public.medical_records FOR DELETE
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));

CREATE TRIGGER medical_records_set_updated_at BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- documents
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  notes_enc text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON public.documents FOR SELECT
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "documents_insert" ON public.documents FOR INSERT
  TO authenticated WITH CHECK (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "documents_update" ON public.documents FOR UPDATE
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));
CREATE POLICY "documents_delete" ON public.documents FOR DELETE
  TO authenticated USING (public.is_household_member(auth.uid(), household_id));

CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- storage policies for vault bucket; path convention: <household_id>/<uuid>
CREATE POLICY "vault_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vault' AND public.is_household_member(auth.uid(), (split_part(name, '/', 1))::uuid));
CREATE POLICY "vault_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vault' AND public.is_household_member(auth.uid(), (split_part(name, '/', 1))::uuid));
CREATE POLICY "vault_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'vault' AND public.is_household_member(auth.uid(), (split_part(name, '/', 1))::uuid));
CREATE POLICY "vault_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'vault' AND public.is_household_member(auth.uid(), (split_part(name, '/', 1))::uuid));
