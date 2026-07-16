import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, Eye, Copy, Download, Settings, Grid3x3, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/menu-designs")({
  component: MenuDesignSystem,
});

interface MenuTheme {
  id: string;
  name: string;
  category: string;
  restaurantId: string;
  background: {
    color: string;
    image?: string;
    type: "solid" | "gradient" | "image";
    gradientFrom?: string;
    gradientTo?: string;
  };
  text: {
    primary: string;
    secondary: string;
    font: string;
    size: number;
  };
  cards: {
    bgColor: string;
    borderColor: string;
    shadowSize: "none" | "small" | "medium" | "large";
    borderRadius: number;
    hoverEffect: "lift" | "glow" | "scale" | "none";
  };
  buttons: {
    bgColor: string;
    textColor: string;
    borderRadius: number;
    style: "solid" | "outline" | "gradient";
  };
  animations: {
    transitionSpeed: "slow" | "normal" | "fast";
    particleEffect: boolean;
    parallax: boolean;
    fadeIn: boolean;
  };
  sections: {
    header: boolean;
    footer: boolean;
    categories: boolean;
    search: boolean;
    filters: boolean;
  };
}

const PRESET_THEMES: MenuTheme[] = [
  {
    id: "luxury-black",
    name: "Luxury Black",
    category: "Premium",
    restaurantId: "",
    background: { color: "#0a0a0a", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#FFD700", font: "Inter", size: 16 },
    cards: { bgColor: "#1a1a1a", borderColor: "#FFD700", shadowSize: "medium", borderRadius: 16, hoverEffect: "glow" },
    buttons: { bgColor: "#FFD700", textColor: "#000000", borderRadius: 8, style: "solid" },
    animations: { transitionSpeed: "normal", particleEffect: false, parallax: false, fadeIn: true },
    sections: { header: true, footer: true, categories: true, search: true, filters: true },
  },
  {
    id: "modern-white",
    name: "Modern White",
    category: "Minimal",
    restaurantId: "",
    background: { color: "#FFFFFF", type: "solid" },
    text: { primary: "#000000", secondary: "#666666", font: "Poppins", size: 14 },
    cards: { bgColor: "#F5F5F5", borderColor: "#E0E0E0", shadowSize: "small", borderRadius: 8, hoverEffect: "scale" },
    buttons: { bgColor: "#000000", textColor: "#FFFFFF", borderRadius: 6, style: "solid" },
    animations: { transitionSpeed: "normal", particleEffect: false, parallax: false, fadeIn: true },
    sections: { header: true, footer: true, categories: true, search: true, filters: true },
  },
  {
    id: "restaurant-red",
    name: "Restaurant Red",
    category: "Food",
    restaurantId: "",
    background: { color: "#1a0f0f", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#FF6B6B", font: "Roboto", size: 15 },
    cards: { bgColor: "#2a1a1a", borderColor: "#FF6B6B", shadowSize: "medium", borderRadius: 12, hoverEffect: "lift" },
    buttons: { bgColor: "#FF6B6B", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
    animations: { transitionSpeed: "normal", particleEffect: false, parallax: false, fadeIn: true },
    sections: { header: true, footer: true, categories: true, search: true, filters: true },
  },
];

export default function MenuDesignSystem() {
  const [themes, setThemes] = useState<MenuTheme[]>(PRESET_THEMES);
  const [selected, setSelected] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");

  const createTheme = () => {
    if (!newThemeName) return toast.error("Enter a theme name");
    setThemes([
      ...themes,
      {
        id: Date.now().toString(),
        name: newThemeName,
        category: "Custom",
        restaurantId: "",
        background: { color: "#FFFFFF", type: "solid" },
        text: { primary: "#000000", secondary: "#666666", font: "Inter", size: 14 },
        cards: { bgColor: "#F8F8F8", borderColor: "#E8E8E8", shadowSize: "small", borderRadius: 8, hoverEffect: "scale" },
        buttons: { bgColor: "#000000", textColor: "#FFFFFF", borderRadius: 6, style: "solid" },
        animations: { transitionSpeed: "normal", particleEffect: false, parallax: false, fadeIn: true },
        sections: { header: true, footer: true, categories: true, search: true, filters: true },
      },
    ]);
    setNewThemeName("");
    setShowNew(false);
    toast.success("Theme created");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu Design System</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-white text-black rounded">New</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-white/40">{t.category}</div>
              </div>
              <div className="text-xs text-white/60 mb-2">Preview: {t.background.color}</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white/5 rounded">Edit</button>
                <button className="px-3 py-1 bg-white/5 rounded">Duplicate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
