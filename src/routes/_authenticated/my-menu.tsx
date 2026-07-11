import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BrandWordmark } from "@/lib/brand";
import { QrPanel, menuUrl } from "@/components/qr-panel";
import { MenuManager } from "./admin.restaurants.$id";
import { LogOut, ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/my-menu")({
  ssr: false,
  loader: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return { userId: user?.id ?? null };
  },
  component: MyMenu,
});

function MyMenu() {
  const { userId } = Route.useLoaderData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"menu" | "qr">("menu");

  const { data, isLoading } = useQuery({
    queryKey: ["my-menu", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: r } = await supabase.from("restaurants").select("*").eq("owner_id", userId!).maybeSingle();
      if (!r) return null;
      const [cats, items] = await Promise.all([
        supabase.from("categories").select("*").eq("restaurant_id", r.id).order("sort_order").order("created_at"),
        supabase.from("menu_items").select("*").eq("restaurant_id", r.id).order("sort_order").order("created_at"),
      ]);
      return { restaurant: r, categories: cats.data ?? [], items: items.data ?? [] };
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  if (isLoading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!data?.restaurant) return (
    <div className="mx-auto max-w-lg p-10 text-center">
      <div className="card-luxe p-8">
        <p>Your account isn't linked to a restaurant yet. Please contact your Super Admin.</p>
        <button onClick={signOut} className="mt-4 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );
  const r = data.restaurant;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <BrandWordmark />
          <div className="ml-auto flex items-center gap-2">
            <a href={menuUrl(r.slug)} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
              <ExternalLink className="h-3.5 w-3.5" /> View menu
            </a>
            <button onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="card-luxe overflow-hidden">
          {r.banner_url && <img src={r.banner_url} alt="" className="h-32 w-full object-cover sm:h-40" />}
          <div className="flex items-center gap-4 p-5">
            {r.logo_url && <img src={r.logo_url} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-white/10" />}
            <div>
              <h1 className="font-display text-2xl">{r.name}</h1>
              <p className="text-xs text-muted-foreground">{menuUrl(r.slug)}</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 rounded-full border border-border p-1">
          {(["menu", "qr"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition ${
                tab === t ? "bg-[oklch(0.82_0.13_88_/_0.15)] text-foreground ring-gold" : "text-muted-foreground hover:text-foreground"
              }`}>{t}</button>
          ))}
        </nav>

        {tab === "menu" ? (
          <MenuManager restaurantId={r.id} categories={data.categories} items={data.items} canEditCategories={false} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <QrPanel slug={r.slug} name={r.name} />
            <div className="card-luxe p-6 text-sm text-muted-foreground">
              This QR is permanent. Every menu edit is live for customers immediately — no need to reprint.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
