import { createFileRoute, notFound } from "@tanstack/react-router";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { supabase } from "@/integrations/supabase/client";
import { BatLogo } from "@/lib/brand";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FoodDetailModal, type MenuItemDetail } from "@/components/food-detail-modal";
import { MenuSearch } from "@/components/menu-search";

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
    let template: any = null;
    if ((r as any).active_template_id) {
      const { data: t } = await supabase.from("menu_templates").select("*")
        .eq("id", (r as any).active_template_id).eq("is_active", true).maybeSingle();
      template = t;
    }
    supabase.from("qr_scans").insert({ restaurant_id: r.id }).then(() => {}, () => {});
    return { restaurant: r, categories: cats.data ?? [], items: items.data ?? [], template };
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
      <div className="card-luxe rounded-3xl p-8"><p className="text-sm text-muted-foreground">This menu is not available.</p></div>
    </div>
  ),
  component: PublicMenu,
});

const ITEMS_PER_PAGE = 5;

type PageKind =
  | { kind: "cover"; r: any }
  | { kind: "category"; category: any; items: any[]; part: number; totalParts: number; r: any }
  | { kind: "back"; r: any };

function PublicMenu() {
  const { restaurant, categories, items, template } = Route.useLoaderData();
  const palette = (template?.config?.palette ?? {}) as { bg?: string; accent?: string };
  const bookRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [openItem, setOpenItem] = useState<MenuItemDetail | null>(null);
  const catNameById = useMemo(() => {
    const m = new Map<string, string>();
    (categories ?? []).forEach((c: any) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const pages = useMemo<PageKind[]>(() => {
    const out: PageKind[] = [{ kind: "cover", r: restaurant }];
    categories.forEach((c: any) => {
      const catItems = items.filter((i: any) => i.category_id === c.id);
      const parts = Math.max(1, Math.ceil(catItems.length / ITEMS_PER_PAGE));
      for (let p = 0; p < parts; p++) {
        out.push({
          kind: "category",
          category: c,
          items: catItems.slice(p * ITEMS_PER_PAGE, (p + 1) * ITEMS_PER_PAGE),
          part: p + 1,
          totalParts: parts,
          r: restaurant,
        });
      }
    });
    out.push({ kind: "back", r: restaurant });
    return out;
  }, [restaurant, categories, items]);

  function flipPrev() { bookRef.current?.pageFlip()?.flipPrev(); }
  function flipNext() { bookRef.current?.pageFlip()?.flipNext(); }

  const accent = palette.accent ?? restaurant.primary_color;
  const stageBg = palette.bg
    ? `radial-gradient(120% 80% at 50% 0%, ${accent}22, ${palette.bg} 60%)`
    : `radial-gradient(120% 80% at 50% 0%, ${restaurant.primary_color}12, oklch(0.965 0.003 260) 55%)`;

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-2 py-4 sm:px-6"
      style={{ background: stageBg }}
    >
      {/* Subtle stage */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_100%,rgba(0,0,0,0.08),transparent_70%)]" />

      <div className="relative w-full max-w-[1100px] flex-1 flex items-center justify-center">
        <HTMLFlipBook
          ref={bookRef}
          width={isMobile ? 340 : 500}
          height={isMobile ? 520 : 680}
          size="stretch"
          minWidth={300}
          maxWidth={560}
          minHeight={440}
          maxHeight={760}
          showCover={true}
          drawShadow={true}
          flippingTime={800}
          usePortrait={isMobile}
          mobileScrollSupport={false}
          maxShadowOpacity={0.35}
          className="book-shadow"
          style={{}}
          startPage={0}
          startZIndex={0}
          autoSize={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={(e: any) => setCurrentPage(e.data)}
        >
          {pages.map((p, idx) => (
            <Page key={idx} number={idx + 1} total={pages.length}>
              {renderPage(p, (it) => setOpenItem({
                ...it,
                category_name: it.category_id ? catNameById.get(it.category_id) ?? null : null,
              }))}
            </Page>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Bottom controls */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/80 backdrop-blur transition hover:bg-white disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground tabular-nums">
          {String(currentPage + 1).padStart(2, "0")} <span className="opacity-40">/</span> {String(pages.length).padStart(2, "0")}
        </div>
        <button
          onClick={flipNext}
          disabled={currentPage >= pages.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white/80 backdrop-blur transition hover:bg-white disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
        Tap an item to view details, or swipe to turn the page
      </p>

      {/* Search overlay */}
      <MenuSearch
        items={items as any}
        categories={categories as any}
        accent={accent}
        onOpenItem={(it) => setOpenItem({
          ...it,
          category_name: it.category_id ? catNameById.get(it.category_id) ?? null : null,
        })}
      />

      {/* Detail modal */}
      <FoodDetailModal
        item={openItem}
        restaurantName={restaurant.name}
        accent={accent}
        onClose={() => setOpenItem(null)}
      />
    </div>
  );
}

const Page = forwardRef<HTMLDivElement, { number: number; total: number; children: React.ReactNode }>(
  function Page({ children, number }, ref) {
    return (
      <div
        ref={ref}
        className="relative h-full w-full overflow-hidden bg-[oklch(0.985_0.003_90)] text-[oklch(0.12_0.006_260)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, oklch(0.99 0.003 90) 0%, oklch(0.97 0.004 90) 100%)",
        }}
        data-density="hard"
      >
        {/* Paper grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0 0 0) 1px, transparent 1px), radial-gradient(oklch(0 0 0) 1px, transparent 1px)",
            backgroundSize: "3px 3px, 5px 5px",
            backgroundPosition: "0 0, 1px 1px",
          }}
        />
        {/* Inner fold shadow */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/10 to-transparent" />
        <div className="relative h-full w-full">{children}</div>
      </div>
    );
  }
);

function renderPage(p: PageKind, onOpenItem: (i: any) => void) {
  if (p.kind === "cover") return <CoverPage r={p.r} />;
  if (p.kind === "back") return <BackPage r={p.r} />;
  return <CategoryPage {...p} onOpenItem={onOpenItem} />;
}

function CoverPage({ r }: { r: any }) {
  return (
    <div className="flex h-full flex-col items-center justify-between p-8 text-center">
      <div className="w-full">
        {r.banner_url && (
          <div className="mb-6 h-32 w-full overflow-hidden rounded-2xl ring-1 ring-black/10">
            <img src={r.banner_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        {r.logo_url ? (
          <img src={r.logo_url} alt="" className="mb-6 h-20 w-20 rounded-full object-cover ring-2 ring-black/10" />
        ) : (
          <BatLogo className="mb-6 h-14 w-14 text-black/80" />
        )}
        <div className="text-[10px] uppercase tracking-[0.4em] text-black/50">Menu</div>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl" style={{ color: r.primary_color }}>
          {r.name}
        </h1>
        {r.welcome_message && (
          <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-black/60">{r.welcome_message}</p>
        )}
      </div>
      <div className="w-full">
        {r.opening_hours && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">{r.opening_hours}</p>
        )}
        <div className="mx-auto mt-3 h-px w-16 bg-black/20" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-black/40">Presented by BAT MENU</p>
      </div>
    </div>
  );
}

function CategoryPage({
  category, items, part, totalParts, r, onOpenItem,
}: {
  category: any; items: any[]; part: number; totalParts: number; r: any;
  onOpenItem: (i: any) => void;
}) {
  return (
    <div className="flex h-full flex-col p-6 sm:p-8">
      <header className="mb-5 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-black/40">
          {category.emoji ? `${category.emoji}  ` : ""}Category
        </p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl" style={{ color: r.primary_color }}>
          {category.name}
        </h2>
        <div className="mx-auto mt-3 h-px w-12 bg-black/25" />
        {totalParts > 1 && (
          <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-black/35">
            Part {part} of {totalParts}
          </p>
        )}
      </header>

      <ul className="flex-1 space-y-4 overflow-hidden">
        {items.length === 0 ? (
          <li className="pt-12 text-center text-xs text-black/40">No items yet.</li>
        ) : items.map((i) => (
          <li key={i.id} className="border-b border-dashed border-black/10 pb-3 last:border-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenItem(i); }}
              className="group w-full text-left transition active:scale-[0.99]"
            >
              <div className="flex items-baseline gap-3">
                <h3 className="font-display text-lg leading-tight text-black transition group-hover:opacity-70">
                  {i.name}
                </h3>
                <div className="flex-1 translate-y-[-4px] border-b border-dotted border-black/25" />
                <div className="whitespace-nowrap font-display text-lg tabular-nums" style={{ color: r.primary_color }}>
                  {Number(i.price).toFixed(2)}
                </div>
              </div>
              {i.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/55">{i.description}</p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {i.is_special && <MiniBadge label="Today's Special" />}
                {i.is_bestseller && <MiniBadge label="Best Seller" />}
                {i.out_of_stock && <MiniBadge label="Out of stock" muted />}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniBadge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
        muted ? "border-black/15 text-black/40" : "border-black/25 text-black/70"
      }`}
    >
      {label}
    </span>
  );
}

function BackPage({ r }: { r: any }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-10 text-center">
      <BatLogo className="h-10 w-10 text-black/70" />
      <p className="mt-6 font-display text-2xl" style={{ color: r.primary_color }}>Thank you</p>
      <p className="mt-2 max-w-[24ch] text-sm text-black/50">
        We hope you enjoyed browsing our menu.
      </p>
      <div className="mt-8 h-px w-16 bg-black/20" />
      <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-black/40">Powered by BAT MENU</p>
    </div>
  );
}
