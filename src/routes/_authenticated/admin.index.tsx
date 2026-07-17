import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Copy, Trash2, Eye, Upload, ChevronDown,
  Palette, Type, Layout, Star, Zap, Coffee, Pizza,
  ShoppingBag, ChefHat, Utensils, Cake, Search, X,
  Check, ArrowLeft, Pencil, GripVertical, ImagePlus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  component: TemplateStudio,
});

// ─── Types ───────────────────────────────────────────────────────────────────

type Category =
  | "restaurant" | "cafe" | "bakery" | "juice"
  | "fastfood" | "cloud" | "finedining";

type Template = {
  id: string;
  name: string;
  category: Category;
  bg: string;
  accent: string;
  font: string;
  assignedCount: number;
  createdAt: string;
  preview?: string;
};

type EditState = {
  bg: string;
  accent: string;
  font: string;
  name: string;
  category: Category;
  animations: boolean;
  roundedCards: boolean;
  darkMode: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "restaurant", label: "Restaurant", icon: <Utensils size={14} /> },
  { id: "cafe", label: "Café", icon: <Coffee size={14} /> },
  { id: "bakery", label: "Bakery", icon: <Cake size={14} /> },
  { id: "juice", label: "Juice Shop", icon: <Zap size={14} /> },
  { id: "fastfood", label: "Fast Food", icon: <Pizza size={14} /> },
  { id: "cloud", label: "Cloud Kitchen", icon: <ShoppingBag size={14} /> },
  { id: "finedining", label: "Fine Dining", icon: <ChefHat size={14} /> },
];

const FONTS = [
  "Instrument Serif", "Inter", "Georgia",
  "Playfair Display", "DM Sans", "Cormorant",
];

const ACCENT_PRESETS = [
  "#FFD700", "#C0A882", "#E8C97A", "#9B8B6E",
  "#D4AF37", "#B8860B", "#F5DEB3", "#DAA520",
  "#fff", "#222", "#E63946", "#457B9D",
];

const INITIAL_TEMPLATES: Template[] = [
  { id: "t1", name: "Noir Classic", category: "restaurant", bg: "#0a0a0a", accent: "#FFD700", font: "Instrument Serif", assignedCount: 3, createdAt: "2 days ago" },
  { id: "t2", name: "Ivory Café", category: "cafe", bg: "#FAF7F0", accent: "#C0A882", font: "Georgia", assignedCount: 1, createdAt: "2 days ago" },
  { id: "t3", name: "Baker's Gold", category: "bakery", bg: "#1C1410", accent: "#E8C97A", font: "Playfair Display", assignedCount: 0, createdAt: "2 days ago" },
  { id: "t4", name: "Fresh Citrus", category: "juice", bg: "#F0FFF4", accent: "#38A169", font: "DM Sans", assignedCount: 2, createdAt: "2 days ago" },
  { id: "t5", name: "Street Heat", category: "fastfood", bg: "#111", accent: "#E63946", font: "Inter", assignedCount: 0, createdAt: "2 days ago" },
  { id: "t6", name: "Ghost Kitchen", category: "cloud", bg: "#0D0D0D", accent: "#9B8B6E", font: "Inter", assignedCount: 1, createdAt: "2 days ago" },
  { id: "t7", name: "Prestige", category: "finedining", bg: "#080808", accent: "#D4AF37", font: "Cormorant", assignedCount: 4, createdAt: "2 days ago" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TemplateStudio() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Template | null>(null);
  const [previewing, setPreviewing] = useState<Template | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [tab, setTab] = useState<"style" | "layout" | "assign">("style");

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function startEdit(t: Template) {
    setEditing(t);
    setEditState({
      bg: t.bg, accent: t.accent, font: t.font,
      name: t.name, category: t.category,
      animations: true, roundedCards: true, darkMode: t.bg.startsWith("#0") || t.bg.startsWith("#1"),
    });
    setTab("style");
  }

  function saveEdit() {
    if (!editing || !editState) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editing.id
          ? { ...t, ...editState }
          : t
      )
    );
    setEditing(null);
    toast.success("Template saved");
  }

  function duplicateTemplate(t: Template) {
    const copy: Template = {
      ...t,
      id: `t${Date.now()}`,
      name: `${t.name} (Copy)`,
      assignedCount: 0,
      createdAt: "Just now",
    };
    setTemplates((prev) => [...prev, copy]);
    toast.success("Template duplicated");
  }

  function deleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  }

  function addNew() {
    const blank: Template = {
      id: `t${Date.now()}`,
      name: "New Template",
      category: "restaurant",
      bg: "#0a0a0a",
      accent: "#FFD700",
      font: "Inter",
      assignedCount: 0,
      createdAt: "Just now",
    };
    setTemplates((prev) => [blank, ...prev]);
    startEdit(blank);
  }

  // ── Editor Panel ──────────────────────────────────────────────────────────
  if (editing && editState) {
    return (
      <EditorPanel
        template={editing}
        state={editState}
        setState={setEditState}
        tab={tab}
        setTab={setTab}
        onSave={saveEdit}
        onClose={() => setEditing(null)}
      />
    );
  }

  // ── Preview Modal ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/8 bg-[#080808]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl tracking-tight">Design Studio</h1>
              <p className="text-[11px] text-white/40 mt-0.5 tracking-widest uppercase">
                {templates.length} templates
              </p>
            </div>
            <button
              onClick={addNew}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-[13px] font-medium text-black transition hover:bg-white/90 active:scale-95"
            >
              <Plus size={15} /> New Template
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="relative flex-shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-36 rounded-xl border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-[12px] outline-none placeholder:text-white/25 focus:border-white/25"
              />
            </div>

            {/* Category pills */}
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-widest transition ${activeCategory === "all" ? "bg-white text-black" : "border border-white/12 text-white/50 hover:border-white/25"}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-widest transition ${activeCategory === c.id ? "bg-white text-black" : "border border-white/12 text-white/50 hover:border-white/25"}`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <TemplateCard
                  template={t}
                  onEdit={() => startEdit(t)}
                  onDuplicate={() => duplicateTemplate(t)}
                  onDelete={() => deleteTemplate(t.id)}
                  onPreview={() => setPreviewing(t)}
                />
              </motion.div>
            ))}

            {/* Add new card */}
            <motion.button
              layout
              onClick={addNew}
              className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 text-white/30 transition hover:border-white/30 hover:text-white/50"
            >
              <Plus size={28} />
              <span className="text-[11px] uppercase tracking-widest">New Template</span>
            </motion.button>
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-24 text-center text-white/30">
            <Layout size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No templates found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewing && (
          <PreviewModal template={previewing} onClose={() => setPreviewing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template: t,
  onEdit, onDuplicate, onDelete, onPreview,
}: {
  template: Template;
  onEdit: () => void; onDuplicate: () => void;
  onDelete: () => void; onPreview: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === t.category);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] transition hover:border-white/16">
      {/* Mini preview */}
      <div
        className="relative h-44 overflow-hidden"
        style={{ background: t.bg }}
      >
        {/* Fake menu preview */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <div
            className="h-1.5 w-20 rounded-full opacity-80"
            style={{ background: t.accent }}
          />
          <div className="h-1 w-32 rounded-full bg-white/20" />
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 w-12 rounded-xl"
                style={{ background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}
              />
            ))}
          </div>
          <div className="mt-2 h-1 w-24 rounded-full bg-white/10" />
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[11px] text-white backdrop-blur transition hover:bg-white/20"
          >
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[11px] text-black transition hover:bg-white/90"
          >
            <Pencil size={12} /> Edit
          </button>
        </div>

        {/* Category badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur">
          {cat?.icon} {cat?.label}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-medium leading-tight">{t.name}</p>
            <p className="mt-0.5 text-[10px] text-white/35">{t.font} · {t.createdAt}</p>
          </div>
          <div className="flex items-center gap-1">
            {/* Color dot */}
            <span
              className="block h-3 w-3 rounded-full ring-1 ring-white/20"
              style={{ background: t.accent }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-white/35">
            {t.assignedCount > 0
              ? `${t.assignedCount} restaurant${t.assignedCount > 1 ? "s" : ""}`
              : "Unassigned"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicate}
              className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/8 hover:text-white/70"
              title="Duplicate"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-white/30 transition hover:bg-red-500/15 hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editor Panel ─────────────────────────────────────────────────────────────

function EditorPanel({
  template, state, setState, tab, setTab, onSave, onClose,
}: {
  template: Template;
  state: EditState;
  setState: React.Dispatch<React.SetStateAction<EditState | null>>;
  tab: "style" | "layout" | "assign";
  setTab: (t: "style" | "layout" | "assign") => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (patch: Partial<EditState>) =>
    setState((prev) => prev ? { ...prev, ...patch } : prev);

  return (
    <div className="flex h-screen flex-col bg-[#080808] text-white lg:flex-row">
      {/* Left: controls */}
      <div className="flex w-full flex-col border-r border-white/8 lg:w-[360px] lg:flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/80">
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12px] font-medium text-black transition hover:bg-white/90"
          >
            <Check size={13} /> Save
          </button>
        </div>

        {/* Name */}
        <div className="border-b border-white/8 px-5 py-4">
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Template Name</label>
          <input
            value={state.name}
            onChange={(e) => set({ name: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none focus:border-white/25"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {(["style", "layout", "assign"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[11px] uppercase tracking-widest transition ${tab === t ? "border-b-2 border-white text-white" : "text-white/35 hover:text-white/60"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {tab === "style" && (
            <>
              {/* Category */}
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => set({ category: c.id })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[11px] transition ${state.category === c.id ? "border-white bg-white/10 text-white" : "border-white/10 text-white/40 hover:border-white/20"}`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <Label>Background Color</Label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={state.bg}
                    onChange={(e) => set({ bg: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-white/20 bg-transparent"
                  />
                  <input
                    value={state.bg}
                    onChange={(e) => set({ bg: e.target.value })}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-mono outline-none focus:border-white/25"
                  />
                </div>
              </div>

              {/* Accent */}
              <div>
                <Label>Accent Color</Label>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {ACCENT_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set({ accent: c })}
                      className={`h-8 w-full rounded-lg ring-offset-[#080808] transition ${state.accent === c ? "ring-2 ring-white ring-offset-2" : ""}`}
                      style={{ background: c, border: c === "#fff" ? "1px solid rgba(255,255,255,0.2)" : undefined }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={state.accent}
                    onChange={(e) => set({ accent: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-white/20 bg-transparent"
                  />
                  <input
                    value={state.accent}
                    onChange={(e) => set({ accent: e.target.value })}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-mono outline-none focus:border-white/25"
                  />
                </div>
              </div>

              {/* Font */}
              <div>
                <Label>Font Family</Label>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      onClick={() => set({ font: f })}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition ${state.font === f ? "border-white bg-white/10 text-white" : "border-white/10 text-white/50 hover:border-white/20"}`}
                      style={{ fontFamily: f }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "layout" && (
            <>
              <Toggle
                label="Smooth Animations"
                value={state.animations}
                onChange={(v) => set({ animations: v })}
              />
              <Toggle
                label="Rounded Food Cards"
                value={state.roundedCards}
                onChange={(v) => set({ roundedCards: v })}
              />
              <Toggle
                label="Dark Mode"
                value={state.darkMode}
                onChange={(v) => set({ darkMode: v })}
              />
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[12px] text-white/40">
                More layout options (card style, grid columns, category display) coming soon.
              </div>
            </>
          )}

          {tab === "assign" && (
            <div>
              <Label>Assign to Restaurants</Label>
              <p className="mt-1 text-[11px] text-white/35">
                Restaurant owners receive up to 10 templates. Assign from the restaurant management page.
              </p>
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4 text-[12px] text-white/40">
                Currently assigned to{" "}
                <span className="text-white">{template.assignedCount}</span> restaurant
                {template.assignedCount !== 1 ? "s" : ""}.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: live preview */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
          <span className="text-[10px] uppercase tracking-widest text-white/30">Live Preview</span>
          <span className="text-[10px] text-white/25">{state.font}</span>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-6">
          <MenuPreview state={state} />
        </div>
      </div>
    </div>
  );
}

// ─── Live Menu Preview ────────────────────────────────────────────────────────

function MenuPreview({ state }: { state: EditState }) {
  const items = [
    { name: "Signature Dish", price: "₹380", tag: "Best Seller" },
    { name: "Chef's Special", price: "₹520" },
    { name: "Classic Favourite", price: "₹290" },
  ];
  const isDark = state.darkMode || state.bg.startsWith("#0") || state.bg.startsWith("#1");
  const textColor = isDark ? "#fff" : "#111";
  const subText = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";

  return (
    <div
      className="w-full max-w-sm overflow-hidden shadow-2xl"
      style={{
        background: state.bg,
        borderRadius: state.roundedCards ? 24 : 8,
        fontFamily: state.font,
        color: textColor,
        minHeight: 520,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-4 text-center">
        <div
          className="mx-auto mb-2 h-1 w-12 rounded-full"
          style={{ background: state.accent }}
        />
        <h2 className="text-2xl font-semibold tracking-tight">BAT MENU</h2>
        <p className="mt-1 text-[11px] uppercase tracking-[0.3em]" style={{ color: subText }}>
          Digital Menu
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-hide">
        {["All", "Starters", "Mains", "Desserts"].map((cat, i) => (
          <span
            key={cat}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider"
            style={
              i === 0
                ? { background: state.accent, color: isDark ? "#000" : "#fff" }
                : { border: `1px solid ${state.accent}40`, color: subText }
            }
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3 px-4 pb-8">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 p-3"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderRadius: state.roundedCards ? 16 : 6,
              border: `1px solid ${state.accent}18`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 flex-shrink-0"
                style={{
                  background: `${state.accent}22`,
                  borderRadius: state.roundedCards ? 12 : 4,
                }}
              />
              <div>
                <p className="text-[13px] font-medium">{item.name}</p>
                {item.tag && (
                  <span
                    className="text-[9px] uppercase tracking-widest"
                    style={{ color: state.accent }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            </div>
            <span
              className="text-[13px] font-semibold"
              style={{ color: state.accent }}
            >
              {item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ template: t, onClose }: { template: Template; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        >
          <X size={14} />
        </button>
        <MenuPreview
          state={{
            bg: t.bg, accent: t.accent, font: t.font, name: t.name,
            category: t.category, animations: true, roundedCards: true,
            darkMode: t.bg.startsWith("#0") || t.bg.startsWith("#1"),
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-white/40">{children}</p>
  );
}

function Toggle({
  label, value, onChange,
}: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
      <span className="text-[13px] text-white/70">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-white" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
  }
