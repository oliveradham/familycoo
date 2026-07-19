
DROP POLICY IF EXISTS documents_update ON public.documents;
CREATE POLICY documents_update ON public.documents FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

DROP POLICY IF EXISTS expenses_update ON public.expenses;
CREATE POLICY expenses_update ON public.expenses FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

DROP POLICY IF EXISTS grocery_update ON public.grocery_items;
CREATE POLICY grocery_update ON public.grocery_items FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

DROP POLICY IF EXISTS maint_update ON public.maintenance_tasks;
CREATE POLICY maint_update ON public.maintenance_tasks FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

DROP POLICY IF EXISTS medical_records_update ON public.medical_records;
CREATE POLICY medical_records_update ON public.medical_records FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

DROP POLICY IF EXISTS trips_update ON public.trips;
CREATE POLICY trips_update ON public.trips FOR UPDATE USING (is_household_member(auth.uid(), household_id)) WITH CHECK (is_household_member(auth.uid(), household_id));

-- Restrict household_members inserts so users cannot self-join arbitrary households.
-- The handle_new_user trigger runs as SECURITY DEFINER and bypasses RLS, so onboarding is unaffected.
-- Only existing members of a household can add memberships (for themselves) via the client.
DROP POLICY IF EXISTS "insert own memberships" ON public.household_members;
CREATE POLICY "insert own memberships" ON public.household_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_household_member(auth.uid(), household_id));
