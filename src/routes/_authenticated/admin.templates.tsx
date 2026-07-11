import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  TEMPLATE_CATEGORIES, categoryLabel,
  type MenuTemplate, type TemplateConfig, type TemplateCategory,
} from "@/lib/templates";
import { Plus, Save, Trash2, Edit3, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  ssr: false,
  component: TemplatesPage,
});

function useTemplates() {
  return useQuery({
    queryKey: ["menu_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_templates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MenuTemplate[];
    },
  });
}

function TemplatesPage() {
  const qc = useQueryClient();
  const { data: templates = [], isLoading } = useTemplates();
  const [editing, setEditing] = useState<MenuTemplate | "new" | null>(null);
  const [filter, setFilter] = useState<"all" | TemplateCategory>("all");

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu_templates"] }); toast.success("Template deleted"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("menu_templates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu_templates"] }),
  });

  const visible = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Menu Templates</h1>
          <p className="text-sm text-muted-foreground">
            Design and manage the premium template library. Only Super Admin can create, edit, or delete templates.
          </p>
        </div>
        <button onClick={() => setEditing("new")}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm">
          <Plus className="h-4 w-4" /> New template
        </button>
      </header>

      <div className="flex flex-wrap gap-1.5 overflow-x-auto rounded-full border border-border p-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        {TEMPLATE_CATEGORIES.map((c) => (
          <FilterChip key={c.value} active={filter === c.value} onClick={() => setFilter(c.value)}>
            {c.label}
          </FilterChip>
        ))}
      </div>

      {editing && (
        <TemplateEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["menu_templates"] }); }}
        />
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer h-56 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.length === 0 && (
            <div className="col-span-full card-luxe p-10 text-center text-sm text-muted-foreground">
              No templates in this category yet.
            </div>
          )}
          {visible.map((t) => (
            <TemplateCard key={t.id} t={t}
              onEdit={() => setEditing(t)}
              onDelete={() => { if (confirm(`Delete "${t.name}"?`)) del.mutate(t.id); }}
              onToggle={() => toggleActive.mutate({ id: t.id, is_active: !t.is_active })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs uppercase tracking-wider transition ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}>{children}</button>
  );
}

function TemplateCard({ t, onEdit, onDelete, onToggle }: {
  t: MenuTemplate; onEdit: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const cfg = (t.config ?? {}) as TemplateConfig;
  const p = cfg.palette ?? {};
  return (
    <div className="card-luxe overflow-hidden">
      <div
        className="relative h-40"
        style={{
          background: `linear-gradient(135deg, ${p.bg ?? "#111"} 0%, ${p.surface ?? "#222"} 100%)`,
          color: p.text ?? "#fff",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">
            {categoryLabel(t.category)}
          </div>
          <div>
            <p className="font-display text-2xl leading-tight" style={{ fontFamily: cfg.typography?.display }}>
              {t.name}
            </p>
            <div className="mt-2 h-px w-10" style={{ background: p.accent ?? "#fff", opacity: 0.7 }} />
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-1">
          {[p.bg, p.surface, p.text, p.accent].map((c, i) => c && (
            <span key={i} className="h-3 w-3 rounded-full ring-1 ring-black/20" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground line-clamp-2">{t.description ?? ""}</p>
          {t.is_premium && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={t.is_active} onChange={onToggle}
              className="h-3.5 w-3.5 accent-foreground" />
            Active
          </label>
          <div className="flex gap-1">
            <button onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-white/5">
              <Edit3 className="h-3 w-3" /> Edit
            </button>
            <button onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CONFIG: TemplateConfig = {
  palette: { bg: "#0a0a0a", surface: "#141414", text: "#f4efe6", accent: "#c9a94c" },
  typography: { display: "Instrument Serif", body: "Inter" },
  cover: "editorial",
  card: "line-item",
  animation: "fade",
};

function TemplateEditor({ initial, onClose, onSaved }: {
  initial: MenuTemplate | null; onClose: () => void; onSaved: () => void;
}) {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<TemplateCategory>((initial?.category as TemplateCategory) ?? "fine_dining");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [cfg, setCfg] = useState<TemplateConfig>((initial?.config as TemplateConfig) ?? DEFAULT_CONFIG);
  const [isPremium, setIsPremium] = useState(initial?.is_premium ?? true);
  const [busy, setBusy] = useState(false);

  const p = cfg.palette ?? {};

  async function save() {
    if (!name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    try {
      const payload = {
        name: name.trim(), category, description: description || null,
        is_premium: isPremium, config: cfg as any,
      };
      if (isNew) {
        const { error } = await supabase.from("menu_templates").insert(payload);
        if (error) throw error;
        toast.success("Template created");
      } else {
        const { error } = await supabase.from("menu_templates").update(payload).eq("id", initial!.id);
        if (error) throw error;
        toast.success("Template saved");
      }
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  }

  function setPalette(k: keyof NonNullable<TemplateConfig["palette"]>, v: string) {
    setCfg((c) => ({ ...c, palette: { ...(c.palette ?? {}), [k]: v } }));
  }

  return (
    <div className="card-luxe overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 p-4">
        <h2 className="font-display text-xl">{isNew ? "New template" : `Edit — ${initial!.name}`}</h2>
        <button onClick={onClose} className="rounded-lg border border-border p-1.5 hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Template name">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50" />
            </Field>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50">
                {TEMPLATE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <input value={description ?? ""} onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50" />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Palette</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <ColorField label="Background" value={p.bg ?? "#0a0a0a"} onChange={(v) => setPalette("bg", v)} />
              <ColorField label="Surface" value={p.surface ?? "#141414"} onChange={(v) => setPalette("surface", v)} />
              <ColorField label="Text" value={p.text ?? "#ffffff"} onChange={(v) => setPalette("text", v)} />
              <ColorField label="Accent" value={p.accent ?? "#c9a94c"} onChange={(v) => setPalette("accent", v)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Cover">
              <select value={cfg.cover ?? "editorial"} onChange={(e) => setCfg((c) => ({ ...c, cover: e.target.value as any }))}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm">
                <option value="editorial">Editorial</option>
                <option value="minimal">Minimal</option>
                <option value="hero-image">Hero image</option>
                <option value="illustrated">Illustrated</option>
              </select>
            </Field>
            <Field label="Item card">
              <select value={cfg.card ?? "line-item"} onChange={(e) => setCfg((c) => ({ ...c, card: e.target.value as any }))}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm">
                <option value="line-item">Line item</option>
                <option value="image-card">Image card</option>
              </select>
            </Field>
            <Field label="Animation">
              <select value={cfg.animation ?? "fade"} onChange={(e) => setCfg((c) => ({ ...c, animation: e.target.value as any }))}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm">
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
            </Field>
            <Field label="Display font">
              <input value={cfg.typography?.display ?? ""} onChange={(e) => setCfg((c) => ({ ...c, typography: { ...(c.typography ?? {}), display: e.target.value } }))}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm" placeholder="Instrument Serif" />
            </Field>
            <Field label="Body font">
              <input value={cfg.typography?.body ?? ""} onChange={(e) => setCfg((c) => ({ ...c, typography: { ...(c.typography ?? {}), body: e.target.value } }))}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm" placeholder="Inter" />
            </Field>
            <Field label="Premium">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm">
                <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="accent-foreground" />
                Mark as premium
              </label>
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={busy} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm">
              <Save className="h-4 w-4" /> {busy ? "Saving…" : isNew ? "Create template" : "Save changes"}
            </button>
            <button onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-white/5">Cancel</button>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Live preview</p>
          <div
            className="aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-black/10"
            style={{
              background: `linear-gradient(160deg, ${p.bg} 0%, ${p.surface} 100%)`,
              color: p.text,
            }}
          >
            <div className="flex h-full flex-col justify-between p-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] opacity-60">{categoryLabel(category)}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.35em] opacity-60">Menu</div>
              </div>
              <div>
                <p className="font-display leading-[0.95]" style={{ fontFamily: cfg.typography?.display, fontSize: "clamp(28px,7vw,52px)" }}>
                  {name || "Template Name"}
                </p>
                <div className="mt-3 h-px w-12" style={{ background: p.accent, opacity: 0.8 }} />
                <div className="mt-5 space-y-3 text-sm">
                  {["Amuse Bouche", "First Course", "Signature"].map((n, i) => (
                    <div key={n} className="flex items-baseline gap-3">
                      <span style={{ fontFamily: cfg.typography?.display }}>{n}</span>
                      <span className="flex-1 border-b border-dotted opacity-30" />
                      <span style={{ color: p.accent }}>{(24 + i * 6).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Presented by BAT MENU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-black/20 px-2 py-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-md border border-border bg-transparent" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-xs outline-none" />
      </div>
    </label>
  );
}
