import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Store,
  UtensilsCrossed,
  ScanLine,
  Activity,
  Sparkles,
  ArrowUpRight,
  QrCode,
  Palette,
  Video,
  LayoutTemplate,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardHome,
});

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [restaurants, active, items, scansToday, recent] = await Promise.all([
        supabase.from("restaurants").select("*", { count: "exact", head: true }),
        supabase.from("restaurants").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("qr_scans").select("*", { count: "exact", head: true }).gte("scanned_at", since),
        supabase
          .from("restaurants")
          .select("id, name, slug, status, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
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

const quickActions = [
  {
    label: "Create Restaurant",
    description: "Onboard a new restaurant",
    to: "/admin/restaurants/new",
    icon: Plus,
    featured: true,
  },
  {
    label: "Restaurants",
    description: "Browse & manage all restaurants",
    to: "/admin/restaurants",
    icon: Store,
  },
  {
    label: "Menu Builder",
    description: "Build & edit live menus",
    to: "/my-menu",
    icon: UtensilsCrossed,
  },
  {
    label: "QR Generator",
    description: "Generate table QR codes",
    to: "/admin/qr",
    icon: QrCode,
  },
  {
    label: "Design Studio",
    description: "Customize brand & theme",
    to: "/admin/design-studio",
    icon: Palette,
  },
  {
    label: "Video Manager",
    description: "Manage promo video content",
    to: "/admin/videos",
    icon: Video,
  },
  {
    label: "Menu Templates",
    description: "Browse premium menu designs",
    to: "/admin/menu-designs",
    icon: LayoutTemplate,
  },
] as const;

function DashboardHome() {
  const { data, isLoading } = useDashboard();

  const stats = [
    { label: "Restaurants", value: data?.totalRestaurants ?? 0, icon: Store },
    { label: "Active", value: data?.activeRestaurants ?? 0, icon: Activity },
    { label: "Menu items", value: data?.totalItems ?? 0, icon: UtensilsCrossed },
    { label: "QR scans (24h)", value: data?.scansToday ?? 0, icon: ScanLine },
  ];

  const hasRestaurants = (data?.recent ?? []).length > 0;
  const showEmptyState = !isLoading && !hasRestaurants;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="card-luxe relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[oklch(0.82_0.13_88_/_0.08)] blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.82_0.13_88_/_0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[oklch(0.82_0.13_88)]">
              <Sparkles className="h-3 w-3" /> Super Admin
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl">
              Welcome back to your <span className="gold-text">command center</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Create restaurants, design menus, manage themes and generate permanent QR codes — all from a single premium workspace.
            </p>
          </div>
          <Link
            to="/admin/restaurants/new"
            className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-transform duration-200 hover:scale-[1.03]"
          >
            Create Restaurant <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Hero mini-stats */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-border/50 pt-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.82_0.13_88_/_0.25)] bg-[oklch(0.82_0.13_88_/_0.06)] text-[oklch(0.82_0.13_88)]">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-display text-lg leading-none">
                  {isLoading ? (
                    <span className="inline-block h-5 w-10 rounded shimmer" />
                  ) : (
                    s.value.toLocaleString()
                  )}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Quick actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`card-luxe group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 ${
                action.featured
                  ? "border-[oklch(0.82_0.13_88_/_0.4)] bg-[oklch(0.82_0.13_88_/_0.05)]"
                  : "hover:border-[oklch(0.82_0.13_88_/_0.3)]"
              }`}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[oklch(0.82_0.13_88_/_0.25)] bg-[oklch(0.82_0.13_88_/_0.08)] text-[oklch(0.82_0.13_88)] transition-transform duration-300 group-hover:scale-110">
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-medium">{action.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
              <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-[oklch(0.82_0.13_88_/_0)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[oklch(0.82_0.13_88_/_0.6)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Restaurants */}
      <section className="card-luxe p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Recent restaurants</h2>
          <Link to="/admin/restaurants" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>

        {isLoading && (
          <ul className="mt-4 divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <div className="h-11 w-11 shrink-0 rounded-xl shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded shimmer" />
                  <div className="h-2 w-1/5 rounded shimmer" />
                </div>
                <div className="h-6 w-16 rounded-full shimmer" />
              </li>
            ))}
          </ul>
        )}

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[oklch(0.82_0.13_88_/_0.25)] bg-[oklch(0.82_0.13_88_/_0.06)] text-[oklch(0.82_0.13_88)]">
              <Store className="h-7 w-7" />
            </div>
            <p className="font-display text-lg">No restaurants yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Create your first restaurant to start building menus, themes and QR experiences.
            </p>
            <Link
              to="/admin/restaurants/new"
              className="btn-gold mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
            >
              Create First Restaurant <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!isLoading && hasRestaurants && (
          <ul className="mt-4 divide-y divide-border/60">
            {(data?.recent ?? []).map((r) => (
              <li key={r.id} className="flex items-center gap-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.82_0.13_88_/_0.2)] bg-[oklch(0.82_0.13_88_/_0.05)] text-[oklch(0.82_0.13_88)]">
                  <Store className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /m/{r.slug} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    r.status === "active"
                      ? "border-emerald-500/40 text-emerald-300"
                      : "border-red-500/40 text-red-300"
                  }`}
                >
                  {r.status}
                </span>
                <Link
                  to="/admin/restaurants/$id"
                  params={{ id: r.id }}
                  className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
