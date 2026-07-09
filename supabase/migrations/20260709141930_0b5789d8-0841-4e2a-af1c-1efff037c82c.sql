
-- Pin search_path already set on has_role/current_role_name via SET; ensure others
ALTER FUNCTION public.enforce_single_super_admin() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- Restrict SECURITY DEFINER execution to only what needs it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_role_name() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_role_name() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.enforce_single_super_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten qr_scans insert (require the target restaurant to be active)
DROP POLICY IF EXISTS "Anyone logs a scan" ON public.qr_scans;
CREATE POLICY "Scan only active restaurants" ON public.qr_scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.status = 'active'));

-- Bootstrap RPC: allow first-ever super admin (only when none exists)
CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin') THEN
    RAISE EXCEPTION 'A Super Admin already exists';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'super_admin');
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;

-- Helper: check if a super admin exists (public, safe)
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role='super_admin') $$;
REVOKE EXECUTE ON FUNCTION public.super_admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.super_admin_exists() TO anon, authenticated;

-- Storage policies for restaurant-assets (private bucket)
CREATE POLICY "Auth users read restaurant assets" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Anon reads restaurant assets" ON storage.objects FOR SELECT
  TO anon USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Auth users upload restaurant assets" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'restaurant-assets');
CREATE POLICY "Auth users update own uploads" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'restaurant-assets' AND owner = auth.uid());
CREATE POLICY "Auth users delete own uploads" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'restaurant-assets' AND owner = auth.uid());
