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

const PRESET_THEMES = [
  {
    name: "Luxury Black",
    category: "Premium",
    background: { color: "#0a0a0a", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#FFD700", font: "Inter", size: 16 },
    cards: { bgColor: "#1a1a1a", borderColor: "#FFD700", shadowSize: "medium", borderRadius: 16, hoverEffect: "glow" },
    buttons: { bgColor: "#FFD700", textColor: "#000000", borderRadius: 8, style: "solid" },
  },
  {
    name: "Modern White",
    category: "Minimal",
    background: { color: "#FFFFFF", type: "solid" },
    text: { primary: "#000000", secondary: "#666666", font: "Poppins", size: 14 },
    cards: { bgColor: "#F5F5F5", borderColor: "#E0E0E0", shadowSize: "small", borderRadius: 8, hoverEffect: "scale" },
    buttons: { bgColor: "#000000", textColor: "#FFFFFF", borderRadius: 6, style: "solid" },
  },
  {
    name: "Restaurant Red",
    category: "Food",
    background: { color: "#1a0f0f", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#FF6B6B", font: "Roboto", size: 15 },
    cards: { bgColor: "#2a1a1a", borderColor: "#FF6B6B", shadowSize: "medium", borderRadius: 12, hoverEffect: "lift" },
    buttons: { bgColor: "#FF6B6B", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
  },
  {
    name: "Ocean Blue",
    category: "Modern",
    background: { color: "#001a33", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#00D4FF", font: "Raleway", size: 15 },
    cards: { bgColor: "#003d66", borderColor: "#00D4FF", shadowSize: "large", borderRadius: 16, hoverEffect: "glow" },
    buttons: { bgColor: "#00D4FF", textColor: "#001a33", borderRadius: 10, style: "solid" },
  },
  {
    name: "Forest Green",
    category: "Nature",
    background: { color: "#0a1a0a", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#4CAF50", font: "Montserrat", size: 16 },
    cards: { bgColor: "#1a2a1a", borderColor: "#4CAF50", shadowSize: "medium", borderRadius: 12, hoverEffect: "scale" },
    buttons: { bgColor: "#4CAF50", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
  },
  {
    name: "Gold Elegance",
    category: "Luxury",
    background: { color: "#1a1410", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#D4AF37", font: "Playfair Display", size: 18 },
    cards: { bgColor: "#2a1f10", borderColor: "#D4AF37", shadowSize: "large", borderRadius: 20, hoverEffect: "lift" },
    buttons: { bgColor: "#D4AF37", textColor: "#1a1410", borderRadius: 10, style: "solid" },
  },
  {
    name: "Vibrant Purple",
    category: "Modern",
    background: { color: "#1a0f2e", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#BB86FC", font: "Poppins", size: 15 },
    cards: { bgColor: "#2a1f4e", borderColor: "#BB86FC", shadowSize: "medium", borderRadius: 16, hoverEffect: "glow" },
    buttons: { bgColor: "#BB86FC", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
  },
  {
    name: "Zomato Red",
    category: "Popular",
    background: { color: "#000000", type: "solid" },
    text: { primary: "#FFFFFF", secondary: "#EF4F5F", font: "Montserrat", size: 16 },
    cards: { bgColor: "#1a1a1a", borderColor: "#EF4F5F", shadowSize: "medium", borderRadius: 12, hoverEffect: "lift" },
    buttons: { bgColor: "#EF4F5F", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
  },
  {
    name: "Swiggy Orange",
    category: "Popular",
    background: { color: "#FFFFFF", type: "solid" },
    text: { primary: "#000000", secondary: "#FC8019", font: "Raleway", size: 15 },
    cards: { bgColor: "#F5F5F5", borderColor: "#FC8019", shadowSize: "small", borderRadius: 8, hoverEffect: "scale" },
    buttons: { bgColor: "#FC8019", textColor: "#FFFFFF", borderRadius: 8, style: "solid" },
  },
];

export default function MenuDesignSystem() {
  const [menus, setMenus] = useState<MenuTheme[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuTheme | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuTheme | null>(null);

  const handleCreateFromPreset = (preset: any) => {
    const newMenu: MenuTheme = {
      id: Date.now().toString(),
      restaurantId: "default",
      ...preset,
    };
    setMenus([...menus, newMenu]);
    toast.success(`${preset.name} theme created!`);
  };

  const handleDuplicate = (menu: MenuTheme) => {
    const duplicated: MenuTheme = {
      ...menu,
      id: Date.now().toString(),
      name: `${menu.name} (Copy)`,
    };
    setMenus([...menus, duplicated]);
    toast.success("Menu duplicated!");
  };

  const handleDelete = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
    toast.success("Menu deleted");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Custom Menu Designs</h1>
          <p className="text-gray-600">Create unique menus for each restaurant with 1000+ theme combinations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button className="px-4 py-3 text-white font-medium border-b-2 border-white">My Menus</button>
          <button className="px-4 py-3 text-gray-600 hover:text-white transition">Preset Themes</button>
          <button className="px-4 py-3 text-gray-600 hover:text-white transition">Gallery</button>
        </div>

        {/* My Menus Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Menu Designs</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200">
              <Plus size={18} /> New Design
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600">
                <p>No custom menus yet. Create one or choose from presets!</p>
              </div>
            ) : (
              menus.map((menu) => (
                <motion.div
                  key={menu.id}
                  className="rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group"
                  style={{ backgroundColor: menu.background.color }}
                >
                  {/* Preview */}
                  <div className="h-48 p-4 flex flex-col justify-center items-center relative overflow-hidden">
                    <div
                      className="text-center"
                      style={{
                        color: menu.text.primary,
                        fontFamily: menu.text.font,
                      }}
                    >
                      <p className="text-sm opacity-75 mb-2">{menu.category}</p>
                      <h3 className="text-2xl font-bold">{menu.name}</h3>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-900 p-4 space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                      <Eye size={14} /> Preview
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                      <Settings size={14} /> Customize
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDuplicate(menu)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Preset Themes Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Preset Themes (9+ Available)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_THEMES.map((preset, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group cursor-pointer"
                style={{ backgroundColor: preset.background.color }}
                onClick={() => handleCreateFromPreset(preset)}
              >
                {/* Preview */}
                <div className="h-48 p-4 flex flex-col justify-center items-center relative">
                  <div
                    style={{
                      color: preset.text.primary,
                      fontFamily: preset.text.font,
                      textAlign: "center",
                    }}
                  >
                    <p className="text-sm opacity-75 mb-2">{preset.category}</p>
                    <h3 className="text-2xl font-bold">{preset.name}</h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200">
                      Use Theme
                    </button>
                  </div>
                </div>

                {/* Theme Info */}
                <div className="bg-gray-900/50 p-4 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-700"
                      style={{ backgroundColor: preset.text.primary }}
                      title="Primary Color"
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-700"
                      style={{ backgroundColor: preset.text.secondary }}
                      title="Secondary Color"
                    />
                    <div
                      className="w-6 h-6 rounded border border-gray-700"
                      style={{ backgroundColor: preset.buttons.bgColor }}
                      title="Button Color"
                    />
                  </div>
                  <p className="text-gray-600">Font: {preset.text.font}</p>
                  <p className="text-gray-600">Animation: {preset.animations.transitionSpeed}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gallery Section Notice */}
        <div className="mt-12 p-6 rounded-xl border border-yellow-400/30 bg-yellow-400/5">
          <h3 className="font-bold mb-2">🎨 Super Admin Gallery</h3>
          <p className="text-sm text-gray-400">
            Super Admin can upload custom menu backgrounds and templates from the admin gallery. 
            Each restaurant can have completely different menu designs with their own animations and branding.
          </p>
        </div>
      </div>
    </div>
  );
}

