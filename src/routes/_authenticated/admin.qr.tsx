import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrPanel, menuUrl } from "@/components/qr-panel";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/qr")({
  component: QrManager,
});

function QrManager() {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["qr-restaurants"],
    queryFn: async () => (await supabase.from("restaurants").select("id, name, slug").order("name")).data ?? [],
  });
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = (data ?? []).filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  const sel = filtered.find((r) => r.id === selected) ?? filtered[0];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl">QR Manager</h1>
        <p className="text-sm text-muted-foreground">Every restaurant has one permanent QR. Download PNG/SVG or share.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card-luxe p-3">
          <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <ul className="mt-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((r) => (
              <li key={r.id}>
                <button onClick={() => setSelected(r.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    sel?.id === r.id ? "bg-[oklch(0.82_0.13_88_/_0.12)] ring-gold" : "hover:bg-white/5"
                  }`}>
                  <span>{r.name}</span>
                  <span className="text-xs text-muted-foreground">/{r.slug}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="p-4 text-center text-xs text-muted-foreground">No matches</li>}
          </ul>
        </aside>
        {sel ? (
          <div className="space-y-4">
            <QrPanel slug={sel.slug} name={sel.name} />
            <div className="card-luxe p-4 text-sm">
              <p className="text-muted-foreground">Menu URL</p>
              <p className="font-mono text-xs break-all">{menuUrl(sel.slug)}</p>
            </div>
            <ScanStats restaurantId={sel.id} />
          </div>
        ) : (
          <div className="card-luxe p-10 text-center text-sm text-muted-foreground">Select a restaurant.</div>
        )}
      </div>
    </div>
  );
}

function ScanStats({ restaurantId }: { restaurantId: string }) {
  const { data } = useQuery({
    queryKey: ["qr-scans", restaurantId],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const [total, recent] = await Promise.all([
        supabase.from("qr_scans").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
        supabase.from("qr_scans").select("scanned_at").eq("restaurant_id", restaurantId).gte("scanned_at", since),
      ]);
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
        days[d] = 0;
      }
      (recent.data ?? []).forEach((r: any) => {
        const d = new Date(r.scanned_at).toISOString().slice(0, 10);
        if (d in days) days[d]++;
      });
      const today = new Date().toISOString().slice(0, 10);
      return {
        total: total.count ?? 0,
        week: (recent.data ?? []).length,
        today: days[today] ?? 0,
        series: Object.entries(days),
      };
    },
  });
  const max = Math.max(1, ...(data?.series.map(([, v]) => v as number) ?? [1]));
  return (
    <div className="card-luxe p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Scan Analytics</h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last 7 days</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Total" value={data?.total ?? 0} />
        <Stat label="This week" value={data?.week ?? 0} />
        <Stat label="Today" value={data?.today ?? 0} />
      </div>
      <div className="mt-4 flex h-20 items-end gap-1.5">
        {(data?.series ?? []).map(([d, v]) => (
          <div key={d} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-[oklch(0.82_0.13_88)]/70 transition-all"
              style={{ height: `${((v as number) / max) * 100}%`, minHeight: 2 }}
            />
            <span className="text-[9px] text-muted-foreground">{d.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

