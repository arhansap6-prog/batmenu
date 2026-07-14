
-- Storage policies for promo-videos (private bucket, admin write, authenticated read via signed URLs handled in code)
CREATE POLICY "promo_videos_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'promo-videos' AND public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (bucket_id = 'promo-videos' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "promo_videos_read_all_auth" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'promo-videos');
