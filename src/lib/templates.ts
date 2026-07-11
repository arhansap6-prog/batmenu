export type TemplateCategory =
  | "fine_dining" | "modern_restaurant" | "luxury_cafe" | "coffee_shop"
  | "bakery" | "juice_bar" | "fast_food" | "cloud_kitchen"
  | "rooftop" | "lounge" | "street_food" | "family";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "fine_dining", label: "Fine Dining" },
  { value: "modern_restaurant", label: "Modern Restaurant" },
  { value: "luxury_cafe", label: "Luxury Café" },
  { value: "coffee_shop", label: "Coffee Shop" },
  { value: "bakery", label: "Bakery" },
  { value: "juice_bar", label: "Juice Bar" },
  { value: "fast_food", label: "Fast Food" },
  { value: "cloud_kitchen", label: "Cloud Kitchen" },
  { value: "rooftop", label: "Rooftop" },
  { value: "lounge", label: "Lounge" },
  { value: "street_food", label: "Street Food" },
  { value: "family", label: "Family Restaurant" },
];

export type TemplateConfig = {
  palette?: { bg?: string; surface?: string; text?: string; accent?: string };
  typography?: { display?: string; body?: string };
  cover?: "editorial" | "minimal" | "hero-image" | "illustrated";
  card?: "line-item" | "image-card";
  animation?: "fade" | "slide";
};

export type MenuTemplate = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  preview_url: string | null;
  is_premium: boolean;
  is_active: boolean;
  config: TemplateConfig;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const MAX_OWNER_TEMPLATES = 10;

export function categoryLabel(v: string): string {
  return TEMPLATE_CATEGORIES.find((c) => c.value === v)?.label ?? v;
}
