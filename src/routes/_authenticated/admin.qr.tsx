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
