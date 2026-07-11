import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  categoryLabel, MAX_OWNER_TEMPLATES,
  type MenuTemplate, type TemplateConfig,
} from "@/lib/templates";
import { Check, Save, Sparkles } from "lucide-react";

export function TemplateAssignmentPanel({ restaurantId }: { restaurantId: string }) {
  const qc = useQueryClient();

  const rq = useQuery({
    queryKey: ["restaurant-template-assignment", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants")
        .select("id, active_template_id, assigned_template_ids")
        .eq("id", restaurantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const tq = useQuery({
    queryKey: ["menu_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_templates").select("*")
        .eq("is_active", true).order("category").order("name");
      if (error) throw error;
      return (data ?? []) as unknown as MenuTemplate[];
    },
  });

  const [assigned, setAssigned] = useState<string[] | null>(null);
  const [active, setActive] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  if (rq.isLoading || tq.isLoading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading templates…</div>;
  if (!rq.data) return <div className="p-10 text-center text-sm">Restaurant not found.</div>;

  const currentAssigned = assigned ?? (rq.data.assigned_template_ids ?? []);
  const currentActive = active === undefined ? rq.data.active_template_id : active;
  const templates = tq.data ?? [];

  function toggle(id: string) {
    const has = currentAssigned.includes(id);
    if (has) {
      setAssigned(currentAssigned.filter((x) => x !== id));
      if (currentActive === id) setActive(null);
    } else {
      if (currentAssigned.length >= MAX_OWNER_TEMPLATES) {
        toast.error(`Owners can access up to ${MAX_OWNER_TEMPLATES} templates`);
        return;
      }
      setAssigned([...currentAssigned, id]);
    }
  }

  function setAsActive(id: string) {
    setActive(id);
    if (!currentAssigned.includes(id)) {
      if (currentAssigned.length >= MAX_OWNER_TEMPLATES) {
        toast.error(`Owners can access up to ${MAX_OWNER_TEMPLATES} templates`);
        return;
      }
      setAssigned([...currentAssigned, id]);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const { error } = await supabase.from("restaurants").update({
        active_template_id: currentActive ?? null,
        assigned_template_ids: currentAssigned,
      }).eq("id", restaurantId);
      if (error) throw error;
      toast.success("Templates saved");
      qc.invalidateQueries({ queryKey: ["restaurant-template-assignment", restaurantId] });
      qc.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  }

  const dirty = assigned !== null || active !== undefined;

  const grouped = templates.reduce<Record<string, MenuTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="card-luxe flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl">Assigned templates</h3>
          <p className="text-sm text-muted-foreground">
            The restaurant owner can switch between assigned templates only. Max {MAX_OWNER_TEMPLATES}. Selected: <span className="text-foreground">{currentAssigned.length}</span>.
          </p>
        </div>
        <button onClick={save} disabled={!dirty || busy}
          className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm disabled:opacity-50">
          <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save"}
        </button>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <section key={cat} className="space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground">{categoryLabel(cat)}</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => {
              const selected = currentAssigned.includes(t.id);
              const isActive = currentActive === t.id;
              const cfg = (t.config ?? {}) as TemplateConfig;
              const p = cfg.palette ?? {};
              return (
                <div key={t.id}
                  className={`card-luxe overflow-hidden ring-offset-2 transition ${
                    isActive ? "ring-2 ring-foreground" : selected ? "ring-1 ring-foreground/40" : ""
                  }`}>
                  <div className="relative h-28"
                    style={{ background: `linear-gradient(135deg, ${p.bg ?? "#111"}, ${p.surface ?? "#222"})`, color: p.text ?? "#fff" }}>
                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                      <div className="text-[9px] uppercase tracking-[0.3em] opacity-60">{categoryLabel(t.category)}</div>
                      <p className="font-display text-lg leading-tight" style={{ fontFamily: cfg.typography?.display }}>{t.name}</p>
                    </div>
                    {t.is_premium && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-white/80 backdrop-blur">
                        <Sparkles className="h-2.5 w-2.5" /> Premium
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <button onClick={() => toggle(t.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                        selected ? "border-foreground bg-foreground text-background" : "border-border hover:bg-white/5"
                      }`}>
                      {selected ? <><Check className="h-3 w-3" /> Assigned</> : "Assign"}
                    </button>
                    <button onClick={() => setAsActive(t.id)}
                      className={`text-xs uppercase tracking-widest transition ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      {isActive ? "★ Active" : "Set active"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
