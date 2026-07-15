
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Copy, Eye, Settings, Download } from "lucide-react";
import { toast } from "sonner";
import { requireSuperAdmin } from "@/middleware/roleMiddleware";

export const Route = createFileRoute("/_authenticated/admin/menu-designer")({
  beforeLoad: ({ context }) => requireSuperAdmin(context),
  component: MenuDesigner,
});

interface MenuTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  style: {
    layout: "book" | "single_page" | "folded" | "qr_menu" | "card_style";
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    font: string;
    fontSize: number;
    borderRadius: number;
    shadowSize: "none" | "small" | "medium" | "large";
  };
  sections: {
    showHeader: boolean;
    showFooter: boolean;
    showCategories: boolean;
    showImages: boolean;
    showPrices: boolean;
    showDescriptions: boolean;
  };
  animations: {
    transitionSpeed: "slow" | "normal" | "fast";
    enableParticles: boolean;
    enableFadeIn: boolean;
    enableHoverEffect: boolean;
  };
  createdAt: string;
}

const MENU_CATEGORIES = [
  "Fine Dining",
  "Casual Restaurant",
  "Pizza Shop",
  "Burger Joint",
  "Chinese",
  "Cafe",
  "Juice Bar",
  "Bakery",
  "South Indian",
  "North Indian",
  "Bar & Lounge",
  "Ice Cream",
  "Street Food",
  "Hotel",
  "Fast Food",
];

const PRESET_TEMPLATES: MenuTemplate[] = [
  {
    id: "1",
    name: "Luxury Black Gold",
    category: "Fine Dining",
    description: "Premium fine dining menu",
    style: {
      layout: "book",
      backgroundColor: "#0a0a0a",
      textColor: "#ffffff",
      accentColor: "#FFD700",
      font: "Playfair Display",
      fontSize: 16,
      borderRadius: 8,
      shadowSize: "large",
    },
    sections: {
      showHeader: true,
      showFooter: true,
      showCategories: true,
      showImages: true,
      showPrices: true,
      showDescriptions: true,
    },
    animations: {
      transitionSpeed: "normal",
      enableParticles: false,
      enableFadeIn: true,
      enableHoverEffect: true,
    },
    createdAt: "2026-07-14",
  },
  {
    id: "2",
    name: "Modern Minimal",
    category: "Casual Restaurant",
    description: "Clean and modern design",
    style: {
      layout: "single_page",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      accentColor: "#ff6b6b",
      font: "Poppins",
      fontSize: 14,
      borderRadius: 4,
      shadowSize: "small",
    },
    sections: {
      showHeader: true,
      showFooter: false,
      showCategories: true,
      showImages: true,
      showPrices: true,
      showDescriptions: false,
    },
    animations: {
      transitionSpeed: "fast",
      enableParticles: false,
      enableFadeIn: true,
      enableHoverEffect: true,
    },
    createdAt: "2026-07-14",
  },
  {
    id: "3",
    name: "Pizza Shop Red",
    category: "Pizza Shop",
    description: "Vibrant pizza restaurant menu",
    style: {
      layout: "card_style",
      backgroundColor: "#1a0f0f",
      textColor: "#ffffff",
      accentColor: "#ff6b6b",
      font: "Roboto",
      fontSize: 15,
      borderRadius: 12,
      shadowSize: "medium",
    },
    sections: {
      showHeader: true,
      showFooter: true,
      showCategories: true,
      showImages: true,
      showPrices: true,
      showDescriptions: true,
    },
    animations: {
      transitionSpeed: "normal",
      enableParticles: true,
      enableFadeIn: true,
      enableHoverEffect: true,
    },
    createdAt: "2026-07-14",
  },
  {
    id: "4",
    name: "Cafe Cozy",
    category: "Cafe",
    description: "Warm and welcoming cafe menu",
    style: {
      layout: "folded",
      backgroundColor: "#f5e6d3",
      textColor: "#3e2723",
      accentColor: "#8d6e63",
      font: "Lora",
      fontSize: 14,
      borderRadius: 6,
      shadowSize: "small",
    },
    sections: {
      showHeader: true,
      showFooter: true,
      showCategories: true,
      showImages: true,
      showPrices: true,
      showDescriptions: true,
    },
    animations: {
      transitionSpeed: "slow",
      enableParticles: false,
      enableFadeIn: true,
      enableHoverEffect: false,
    },
    createdAt: "2026-07-14",
  },
  {
    id: "5",
    name: "QR Menu Tech",
    category: "Fast Food",
    description: "Modern QR code menu",
    style: {
      layout: "qr_menu",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      accentColor: "#00d4ff",
      font: "Inter",
      fontSize: 13,
      borderRadius: 8,
      shadowSize: "medium",
    },
    sections: {
      showHeader: true,
      showFooter: false,
      showCategories: true,
      showImages: true,
      showPrices: true,
      showDescriptions: true,
    },
    animations: {
      transitionSpeed: "fast",
      enableParticles: false,
      enableFadeIn: true,
      enableHoverEffect: true,
    },
    createdAt: "2026-07-14",
  },
];

export default function MenuDesigner() {
  const [templates, setTemplates] = useState<MenuTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<MenuTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleCreateFromPreset = (preset: MenuTemplate) => {
    const newTemplate = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
    };
    setTemplates([...templates, newTemplate]);
    toast.success("Template created!");
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleDuplicate = (template: MenuTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
    };
    setTemplates([...templates, newTemplate]);
    toast.success("Template duplicated!");
  };

  const handleSaveTemplate = (template: MenuTemplate) => {
    setTemplates(
      templates.map((t) => (t.id === template.id ? template : t))
    );
    setShowEditor(false);
    setEditingTemplate(null);
    toast.success("Template saved!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Menu Designer</h1>
          <p className="text-gray-600">Create and manage 200+ professional menu templates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button className="px-4 py-3 text-white font-medium border-b-2 border-white">
            My Templates
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-white transition">
            Presets
          </button>
        </div>

        {/* My Templates */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Templates ({templates.length})</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
            >
              <Plus size={18} /> Create New
            </motion.button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p>No templates yet. Create one or use a preset!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group"
                  style={{ backgroundColor: template.style.backgroundColor }}
                >
                  {/* Preview */}
                  <div className="h-48 p-6 flex flex-col justify-center relative">
                    <p
                      className="text-sm opacity-75 mb-2"
                      style={{ color: template.style.accentColor }}
                    >
                      {template.category}
                    </p>
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        color: template.style.textColor,
                        fontFamily: template.style.font,
                      }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-xs mt-2 opacity-60"
                      style={{ color: template.style.textColor }}
                    >
                      {template.style.layout}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-900 p-4 space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowEditor(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Presets Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Preset Templates (5+ Available)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_TEMPLATES.map((preset) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group cursor-pointer"
                style={{ backgroundColor: preset.style.backgroundColor }}
              >
                {/* Preview */}
                <div className="h-48 p-6 flex flex-col justify-center relative">
                  <p
                    className="text-sm opacity-75 mb-2"
                    style={{ color: preset.style.accentColor }}
                  >
                    {preset.category}
                  </p>
                  <h3
                    className="text-2xl font-bold"
                    style={{
                      color: preset.style.textColor,
                      fontFamily: preset.style.font,
                    }}
                  >
                    {preset.name}
                  </h3>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => handleCreateFromPreset(preset)}
                      className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
                    >
                      Use Template
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-gray-900/50 p-4">
                  <p className="text-xs text-gray-600">{preset.style.layout}</p>
                  <p className="text-xs text-gray-700 mt-1">{preset.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <TemplateEditor
            template={editingTemplate}
            onSave={handleSaveTemplate}
            onClose={() => {
              setShowEditor(false);
              setEditingTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Template Editor Component
function TemplateEditor({
  template,
  onSave,
  onClose,
}: {
  template: MenuTemplate | null;
  onSave: (template: MenuTemplate) => void;
  onClose: () => void;
}) {
  const [editedTemplate, setEditedTemplate] = useState(
    template || {
      id: Date.now().toString(),
      name: "New Template",
      category: "Fine Dining",
      description: "Custom template",
      style: {
        layout: "book" as const,
        backgroundColor: "#000000",
        textColor: "#ffffff",
        accentColor: "#FFD700",
        font: "Inter",
        fontSize: 16,
        borderRadius: 8,
        shadowSize: "medium" as const,
      },
      sections: {
        showHeader: true,
        showFooter: true,
        showCategories: true,
        showImages: true,
        showPrices: true,
        showDescriptions: true,
      },
      animations: {
        transitionSpeed: "normal" as const,
        enableParticles: false,
        enableFadeIn: true,
        enableHoverEffect: true,
      },
      createdAt: new Date().toISOString().split("T")[0],
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {template ? "Edit Template" : "Create Template"}
        </h2>

        <div className="space-y-4 text-white">
          {/* Name */}
          <div>
            <label className="block text-sm mb-2">Template Name</label>
            <input
              type="text"
              value={editedTemplate.name}
              onChange={(e) =>
                setEditedTemplate({ ...editedTemplate, name: e.target.value })
              }
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
            />
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm mb-2">Layout</label>
            <select
              value={editedTemplate.style.layout}
              onChange={(e) =>
                setEditedTemplate({
                  ...editedTemplate,
                  style: {
                    ...editedTemplate.style,
                    layout: e.target.value as any,
                  },
                })
              }
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-gray-600"
            >
              <option value="book">Book Style</option>
              <option value="single_page">Single Page</option>
              <option value="folded">Folded</option>
              <option value="qr_menu">QR Menu</option>
              <option value="card_style">Card Style</option>
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Background</label>
              <input
                type="color"
                value={editedTemplate.style.backgroundColor}
                onChange={(e) =>
                  setEditedTemplate({
                    ...editedTemplate,
                    style: {
                      ...editedTemplate.style,
                      backgroundColor: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Text</label>
              <input
                type="color"
                value={editedTemplate.style.textColor}
                onChange={(e) =>
                  setEditedTemplate({
                    ...editedTemplate,
                    style: { ...editedTemplate.style, textColor: e.target.value },
                  })
                }
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Accent</label>
              <input
                type="color"
                value={editedTemplate.style.accentColor}
                onChange={(e) =>
                  setEditedTemplate({
                    ...editedTemplate,
                    style: { ...editedTemplate.style, accentColor: e.target.value },
                  })
                }
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Sections Toggle */}
          <div className="border-t border-gray-700 pt-4">
            <label className="block text-sm mb-3 font-medium">Show Sections</label>
            <div className="space-y-2">
              {Object.entries(editedTemplate.sections).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setEditedTemplate({
                        ...editedTemplate,
                        sections: {
                          ...editedTemplate.sections,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{key.replace("show", "")}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSave(editedTemplate)}
            className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
          >
            Save Template
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-700 text-white rounded-lg hover:bg-gray-800"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

