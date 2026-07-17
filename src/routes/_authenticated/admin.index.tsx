import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/clire, UtensilsCrossed, ScanLine, Activity, Sparkles, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
component: DashboardHome,
});

function useDashboard() {
return useQuery({
queryKey: ["dashboard"],
queryFn: async () => {
const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const [restaurants, active, items, scansToday, recent] = await Promise.all([
supabase.from("restaurants").select("", { count: "exact", head: true }),
supabase.from("restaurants").select("", { count: "exact", head: true }).eq("status", "active"),
supabase.from("menu_items").select("", { count: "exact", head: true }),
supabase.from("qr_scans").select("", { count: "exact", head: true }).gte("scanned_at", since),
supabase.from("restaurants").select("id, name, slug, status, created_at").order("created_at", { ascending: false }).limit(6),
]);
return {
totalRestaurants: restaurants.count ?? 0,
activeRestaurants: active.count ?? 0,
totalItems: items.count ?? 0,
scansToday: scansToday.count ?? 0,
recent: recent.data ?? [],
};
},
staleTime: 15_000,
});
}

function DashboardHome() {
const { data, isLoading } = useDashboard();

const stats = [
{ label: "Restaurants", value: data?.totalRestaurants ?? 0, icon: Store },
{ label: "Active", value: data?.activeRestaurants ?? 0, icon: Activity },
{ label: "Menu items", value: data?.totalItems ?? 0, icon: UtensilsCrossed },
{ label: "QR scans (24h)", value: data?.scansToday ?? 0, icon: ScanLine },
];

return (
<div className="space-y-8">
<section className="card-luxe overflow-hidden p-6 sm:p-8">
<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
<div>
<div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.82_0.13_88_/_0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[oklch(0.82_0.13_88)]">
<Sparkles className="h-3 w-3" /> Super Admin
</div>
<h1 className="mt-4 font-display text-3xl sm:text-4xl">
Welcome to your <span className="gold-text">command center</span>
</h1>
<p className="mt-2 max-w-xl text-sm text-muted-foreground">
Create restaurants, design menus, manage themes and generate permanent QR codes — all from a single premium workspace.
</p>
</div>
<Link to="/admin/restaurants/new" className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm">
Create Restaurant <ArrowUpRight className="h-4 w-4" />
</Link>
</div>
</section>

<section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">  
    {stats.map((s) => (  
      <div key={s.label} className="card-luxe p-5">  
        <div className="flex items-center justify-between text-muted-foreground">  
          <span className="text-[11px] uppercase tracking-widest">{s.label}</span>  
          <s.icon className="h-4 w-4" />  
        </div>  
        <div className="mt-3 font-display text-3xl">  
          {isLoading ? <span className="inline-block h-8 w-16 rounded shimmer" /> : s.value.toLocaleString()}  
        </div>  
      </div>  
    ))}  
  </section>  

  <section className="card-luxe p-5 sm:p-6">  
    <div className="flex items-center justify-between">  
      <h2 className="font-display text-xl">Recent restaurants</h2>  
      <Link to="/admin/restaurants" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>  
    </div>  
    <ul className="mt-4 divide-y divide-border/60">  
      {(data?.recent ?? []).length === 0 && !isLoading && (  
        <li className="py-10 text-center text-sm text-muted-foreground">  
          No restaurants yet. <Link to="/admin/restaurants/new" className="text-[oklch(0.82_0.13_88)] hover:underline">Create the first one</Link>.  
        </li>  
      )}  
      {(data?.recent ?? []).map((r) => (  
        <li key={r.id} className="flex items-center justify-between py-3">  
          <div>  
            <p className="text-sm font-medium">{r.name}</p>  
            <p className="text-xs text-muted-foreground">/m/{r.slug}</p>  
          </div>  
          <div className="flex items-center gap-2">  
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${  
              r.status === "active" ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-300"  
            }`}>{r.status}</span>  
            <Link to="/admin/restaurants/$id" params={{ id: r.id }} className="text-xs text-muted-foreground hover:text-foreground">  
              Open →  
            </Link>  
          </div>  
        </li>  
      ))}  
    </ul>  
  </section>  
</div>

);
}
