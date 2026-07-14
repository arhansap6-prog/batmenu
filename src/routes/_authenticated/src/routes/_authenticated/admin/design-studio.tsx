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
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-gray-700"
              />
              <div className="flex gap-3">
                <input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  placeholder="Category"
                  className="flex-1 bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-gray-700"
                />
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-xs text-gray-600">{template.category}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  <button className="p-2 hover:bg-gray-800 rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="text-5xl mb-4 text-center">{template.preview}</div>

              <div className="flex gap-2 mb-4">
                <div
                  className="h-8 flex-1 rounded-lg border border-gray-800"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <div
                  className="h-8 flex-1 rounded-lg border border-gray-800"
                  style={{ backgroundColor: template.colors.secondary }}
                />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition">
                  <Eye size={14} /> Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition">
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs font-medium transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && !showNew && (
          <div className="text-center py-12 text-gray-600">
            <p>No templates yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

