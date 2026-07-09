import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/restaurants/")({
  component: RestaurantsList,
});

function RestaurantsList() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", q],
    queryFn: async () => {
      let query = supabase.from("restaurants")
        .select("id, name, slug, status, owner_email, created_at")
        .order("created_at", { ascending: false });
      if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Restaurants</h1>
          <p className="text-sm text-muted-foreground">Manage every restaurant on BAT MENU.</p>
        </div>
        <Link to="/admin/restaurants/new" className="btn-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      <div className="card-luxe p-2">
        <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search restaurants…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="card-luxe overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No restaurants yet.</p>
            <Link to="/admin/restaurants/new" className="btn-gold mt-4 inline-flex rounded-full px-4 py-2 text-sm">Create your first restaurant</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {data!.map((r) => (
              <li key={r.id}>
                <Link to="/admin/restaurants/$id" params={{ id: r.id }}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/m/{r.slug} · {r.owner_email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    r.status === "active" ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-300"
                  }`}>{r.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
