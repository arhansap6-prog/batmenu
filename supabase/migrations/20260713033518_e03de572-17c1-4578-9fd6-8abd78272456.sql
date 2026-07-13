
CREATE TABLE IF NOT EXISTS public.promotional_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,
  poster_url TEXT,
  duration_seconds INT,
  file_size_bytes BIGINT,
  format TEXT DEFAULT 'mp4',
  enabled BOOLEAN NOT NULL DEFAULT true,
  show_skip_button BOOLEAN NOT NULL DEFAULT true,
  show_watermark BOOLEAN NOT NULL DEFAULT false,
  allow_mute BOOLEAN NOT NULL DEFAULT true,
  loop_video BOOLEAN NOT NULL DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promotional_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promotional_videos TO authenticated;
GRANT ALL ON public.promotional_videos TO service_role;

ALTER TABLE public.promotional_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled promo videos"
  ON public.promotional_videos FOR SELECT
  USING (enabled = true);

CREATE POLICY "Super admins can view all promo videos"
  ON public.promotional_videos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert promo videos"
  ON public.promotional_videos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update promo videos"
  ON public.promotional_videos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete promo videos"
  ON public.promotional_videos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER promotional_videos_touch_updated_at
  BEFORE UPDATE ON public.promotional_videos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
