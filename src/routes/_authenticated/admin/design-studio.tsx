import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2, Eye, Copy, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/design-studio")({
  component: DesignStudio,
});

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  colors: { primary: string; secondary: string };
  createdAt: string;
}

export default function DesignStudio() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Luxury Black",
      category: "Fine Dining",
      preview: "🖤",
      colors: { primary: "#FFD700", secondary: "#000000" },
      createdAt: "2026-07-13",
    },
    {
      id: "2",
      name: "Modern White",
      category: "Modern Restaurant",
      preview: "⚪",
      colors: { primary: "#000000", secondary: "#FFFFFF" },
      createdAt: "2026-07-12",
    },
  ]);

  const [showNew, setShowNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "" });

  const handleAdd = () => {
    if (!newTemplate.name) {
      toast.error("Enter template name");
      return;
    }
    setTemplates([
      ...templates,
      {
        id: Date.now().toString(),
        name: newTemplate.name,
        category: newTemplate.category,
        preview: "✨",
        colors: { primary: "#FFD700", secondary: "#000000" },
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewTemplate({ name: "", category: "" });
    setShowNew(false);
    toast.success("Template created!");
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Design Studio</h1>
            <p className="text-gray-600 text-sm">Manage menu templates globally</p>
          </div>
          <motion.button
            onClick={() => setShowNew(!showNew)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
          >
            <Plus size={18} /> New Template
          </motion.button>
        </div>

        {/* New Template Form */}
        {showNew && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-xl border border-gray-800 bg-gray-900/50"
          >
            <div className="space-y-4">
              <input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Template name"
                className="w-full p-3 rounded bg-black/20 border border-white/6"
              />
              <input
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                placeholder="Category"
                className="w-full p-3 rounded bg-black/20 border border-white/6"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="px-4 py-2 bg-white text-black rounded">Create</button>
                <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-white/5 text-white rounded">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t.id} className="p-4 rounded-xl border bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-white/40">{t.category}</div>
              </div>
              <div className="text-xs text-white/60 mb-2">Preview: {t.preview}</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white/5 rounded">Edit</button>
                <button className="px-3 py-1 bg-white/5 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
