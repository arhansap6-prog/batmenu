import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/m/$slug")({
  ssr: false,
  loader: async ({ params }) => {
    const { data: r, error } = await supabase
      .from("restaurants").select("*").eq("slug", params.slug).eq("status", "active").maybeSingle();
    if (error) throw error;
    if (!r) throw notFound();
    const [cats, items] = await Promise.all([
      supabase.from("categories").select("*").eq("restaurant_id", r.id).eq("hidden", false).order("sort_order"),
      supabase.from("menu_items").select("*").eq("restaurant_id", r.id).eq("available", true).order("sort_order"),
    ]);
    // Log scan (best-effort)
    supabase.from("qr_scans").insert({ restaurant_id: r.id }).then(() => {}, () => {});
    return { restaurant: r, categories: cats.data ?? [], items: items.data ?? [] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.restaurant.name} — Menu` },
      { name: "description", content: loaderData.restaurant.description ?? `Explore the menu at ${loaderData.restaurant.name}.` },
      { property: "og:title", content: `${loaderData.restaurant.name} — Menu` },
      { property: "og:description", content: loaderData.restaurant.description ?? "Digital menu powered by BAT MENU." },
      ...(loaderData.restaurant.banner_url ? [{ property: "og:image", content: loaderData.restaurant.banner_url }] : []),
    ] : [{ title: "Menu" }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="glass rounded-3xl p-8"><p className="text-sm text-muted-foreground">This menu is not available.</p></div>
    </div>
  ),
  component: PublicMenu,
});

function PublicMenu() {
  const { restaurant, categories, items } = Route.useLoaderData();
  const [pageIdx, setPageIdx] = useState(0); // 0 = cover, 1..N = categories
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const pages = ["cover", ...categories.map((c: { id: string }) => c.id)];
  const total = pages.length;

  useEffect(() => {
    document.documentElement.style.setProperty("--rest-primary", restaurant.primary_color);
    document.documentElement.style.setProperty("--rest-secondary", restaurant.secondary_color);
  }, [restaurant]);

  function goto(i: number) { setPageIdx(Math.max(0, Math.min(total - 1, i))); }

  return (
    <div className="relative min-h-dvh overflow-hidden"
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart == null) return;
        const dx = e.changedTouches[0].clientX - touchStart;
        if (dx > 40) goto(pageIdx - 1);
        if (dx < -40) goto(pageIdx + 1);
        setTouchStart(null);
      }}>
      {/* Backdrop from theme */}
      <div className="absolute inset-0 -z-10"
        style={{ background: `radial-gradient(120% 80% at 50% 0%, ${restaurant.primary_color}22, ${restaurant.secondary_color} 60%)` }} />

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6">
        {pageIdx === 0 ? (
          <CoverPage r={restaurant} onStart={() => goto(1)} hasMenu={categories.length > 0} />
        ) : (
          <CategoryPage
            category={categories[pageIdx - 1]}
            items={items.filter((i: { category_id: string }) => i.category_id === categories[pageIdx - 1].id)}
            index={pageIdx}
            total={categories.length}
            r={restaurant}
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button onClick={() => goto(pageIdx - 1)} disabled={pageIdx === 0}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
          <div className="flex-1 overflow-x-auto">
            <div className="flex justify-center gap-1.5">
              {pages.map((_, i) => (
                <button key={i} onClick={() => goto(i)}
                  className={`h-1.5 rounded-full transition-all ${i === pageIdx ? "w-6 bg-[color:var(--rest-primary)]" : "w-1.5 bg-white/25"}`}
                  aria-label={`Page ${i + 1}`} />
              ))}
            </div>
          </div>
          <button onClick={() => goto(pageIdx + 1)} disabled={pageIdx === total - 1}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
        </div>
      </nav>
    </div>
  );
}

function CoverPage({ r, onStart, hasMenu }: { r: any; onStart: () => void; hasMenu: boolean }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      {r.banner_url && (
        <div className="mb-6 h-40 w-full overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-56">
          <img src={r.banner_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {r.logo_url && <img src={r.logo_url} alt="" className="mb-4 h-20 w-20 rounded-full object-cover ring-2 ring-white/15" />}
      <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "var(--rest-primary)" }}>{r.name}</h1>
      {r.welcome_message && <p className="mt-3 max-w-md text-sm text-white/70">{r.welcome_message}</p>}
      {r.opening_hours && <p className="mt-2 text-xs uppercase tracking-widest text-white/50">{r.opening_hours}</p>}
      {hasMenu ? (
        <button onClick={onStart}
          className="mt-8 rounded-full px-8 py-3 text-sm font-medium"
          style={{ background: "var(--rest-primary)", color: "var(--rest-secondary)" }}>
          View Menu →
        </button>
      ) : (
        <p className="mt-8 text-sm text-white/60">Menu coming soon.</p>
      )}
    </div>
  );
}

function CategoryPage({ category, items, index, total, r }: {
  category: any; items: any[]; index: number; total: number; r: any;
}) {
  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Page {index} of {total}</p>
        <h2 className="mt-2 font-display text-4xl" style={{ color: "var(--rest-primary)" }}>
          {category.emoji ? `${category.emoji} ` : ""}{category.name}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/60">No items in this category yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
              <div className="flex items-start gap-4">
                {i.image_url && (
                  <img src={i.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{i.name}</h3>
                      {i.description && <p className="mt-0.5 text-sm text-white/60">{i.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {i.is_special && <BadgeC label="Today's Special" color={r.primary_color} />}
                        {i.is_bestseller && <BadgeC label="Best Seller" color={r.primary_color} />}
                        {i.out_of_stock && <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">Out of stock</span>}
                      </div>
                    </div>
                    <div className="whitespace-nowrap font-display text-xl" style={{ color: "var(--rest-primary)" }}>
                      {Number(i.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BadgeC({ label, color }: { label: string; color: string }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{label}</span>
  );
}
