
-- Menu templates library (Super Admin owned)
CREATE TABLE public.menu_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.menu_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_templates TO authenticated;
GRANT ALL ON public.menu_templates TO service_role;

ALTER TABLE public.menu_templates ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. public menu viewers) can read active templates
CREATE POLICY "Public can read active templates" ON public.menu_templates
  FOR SELECT USING (is_active = true);

-- Only Super Admin can create / update / delete templates
CREATE POLICY "Super admin can insert templates" ON public.menu_templates
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can update templates" ON public.menu_templates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can delete templates" ON public.menu_templates
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER touch_menu_templates_updated
  BEFORE UPDATE ON public.menu_templates
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Restaurant → template assignment (single active + allowed set)
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS active_template_id UUID REFERENCES public.menu_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_template_ids UUID[] NOT NULL DEFAULT '{}'::uuid[];

-- Seed 12 curated luxury templates
INSERT INTO public.menu_templates (name, category, description, config) VALUES
('Noir Reserve', 'fine_dining', 'Deep black with champagne serifs. Editorial fine-dining.',
  '{"palette":{"bg":"#0a0a0a","surface":"#141414","text":"#f4efe6","accent":"#c9a94c"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"editorial","card":"line-item","animation":"fade"}'),
('Ivory Atelier', 'fine_dining', 'Ivory paper, hairline gold, tall serif titles.',
  '{"palette":{"bg":"#f7f3ec","surface":"#ffffff","text":"#141414","accent":"#8a6a2a"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"minimal","card":"line-item","animation":"fade"}'),
('Modern Slate', 'modern_restaurant', 'Cool greys, sans-serif, image-forward cards.',
  '{"palette":{"bg":"#f4f5f7","surface":"#ffffff","text":"#0f1116","accent":"#3a3f4a"},"typography":{"display":"Inter","body":"Inter"},"cover":"hero-image","card":"image-card","animation":"slide"}'),
('Copper Loft', 'modern_restaurant', 'Warm copper accents on charcoal.',
  '{"palette":{"bg":"#151515","surface":"#1e1e1e","text":"#f2ece1","accent":"#c47a3f"},"typography":{"display":"Inter","body":"Inter"},"cover":"hero-image","card":"image-card","animation":"slide"}'),
('Velour Café', 'luxury_cafe', 'Blush cream, soft serifs, luxury café mood.',
  '{"palette":{"bg":"#f6ecdf","surface":"#fff7ec","text":"#2b1e10","accent":"#a05a3e"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"illustrated","card":"line-item","animation":"fade"}'),
('Espresso Bar', 'coffee_shop', 'Rich espresso brown and cream.',
  '{"palette":{"bg":"#efe4d3","surface":"#f8efe0","text":"#2a1a10","accent":"#6b3a1a"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"minimal","card":"line-item","animation":"fade"}'),
('Fresh Batch', 'bakery', 'Warm butter tones and soft type.',
  '{"palette":{"bg":"#fbf3e3","surface":"#ffffff","text":"#3b2a15","accent":"#c78a3a"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"illustrated","card":"image-card","animation":"fade"}'),
('Citrus Grove', 'juice_bar', 'Bright cream with citrus accents.',
  '{"palette":{"bg":"#fff8e8","surface":"#ffffff","text":"#1e2a12","accent":"#4a8f2f"},"typography":{"display":"Inter","body":"Inter"},"cover":"hero-image","card":"image-card","animation":"slide"}'),
('Neon Diner', 'fast_food', 'Bold black with electric accents.',
  '{"palette":{"bg":"#0d0d0d","surface":"#1a1a1a","text":"#f5f5f5","accent":"#ff5a3c"},"typography":{"display":"Inter","body":"Inter"},"cover":"hero-image","card":"image-card","animation":"slide"}'),
('Cloud Nine', 'cloud_kitchen', 'Airy white with soft gradients.',
  '{"palette":{"bg":"#f9fafc","surface":"#ffffff","text":"#101318","accent":"#4c6ef5"},"typography":{"display":"Inter","body":"Inter"},"cover":"minimal","card":"image-card","animation":"fade"}'),
('Rooftop Aurora', 'rooftop', 'Dusk gradient, luminous type.',
  '{"palette":{"bg":"#0f1220","surface":"#181d33","text":"#f2eef8","accent":"#e0b06a"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"hero-image","card":"line-item","animation":"fade"}'),
('Lounge Onyx', 'lounge', 'Onyx black with gilded serifs. Premium lounge.',
  '{"palette":{"bg":"#050505","surface":"#111111","text":"#ede4c7","accent":"#d4af37"},"typography":{"display":"Instrument Serif","body":"Inter"},"cover":"editorial","card":"line-item","animation":"fade"}');
