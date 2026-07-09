import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QrPanel, menuUrl } from "@/components/qr-panel";
import { ImageUploader } from "@/components/image-uploader";
import {
  deleteRestaurant, setRestaurantStatus, resetOwnerPassword, updateRestaurantMeta,
} from "@/lib/admin.functions";
import { ExternalLink, Trash2, PauseCircle, PlayCircle, KeyRound, Save, Plus, Edit3, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/restaurants/$id")({
  component: RestaurantDetail,
});

function useRestaurant(id: string) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const [r, cats, items, scanCount] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
        supabase.from("categories").select("*").eq("restaurant_id", id).order("sort_order").order("created_at"),
        supabase.from("menu_items").select("*").eq("restaurant_id", id).order("sort_order").order("created_at"),
        supabase.from("qr_scans").select("*", { count: "exact", head: true }).eq("restaurant_id", id),
      ]);
      if (r.error) throw r.error;
      return { restaurant: r.data, categories: cats.data ?? [], items: items.data ?? [], scans: scanCount.count ?? 0 };
    },
  });
}

function RestaurantDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useRestaurant(id);

  const del = useServerFn(deleteRestaurant);
  const setStatus = useServerFn(setRestaurantStatus);
  const resetPw = useServerFn(resetOwnerPassword);
  const updateMeta = useServerFn(updateRestaurantMeta);

  const [tab, setTab] = useState<"menu" | "branding" | "settings" | "qr">("menu");
  const [newPw, setNewPw] = useState("");

  if (isLoading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!data?.restaurant) return <div className="p-10 text-center text-sm">Not found.</div>;
  const r = data.restaurant;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/admin/restaurants" className="text-xs text-muted-foreground hover:text-foreground">← All restaurants</Link>
          <h1 className="mt-1 font-display text-3xl">{r.name}</h1>
          <p className="text-xs text-muted-foreground">{menuUrl(r.slug)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={menuUrl(r.slug)} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <ExternalLink className="h-3.5 w-3.5" /> Open menu
          </a>
          <button onClick={async () => {
              const to = r.status === "active" ? "suspended" : "active";
              await setStatus({ data: { id, status: to } });
              qc.invalidateQueries({ queryKey: ["restaurant", id] });
              toast.success(to === "active" ? "Activated" : "Suspended");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            {r.status === "active" ? <><PauseCircle className="h-3.5 w-3.5" /> Suspend</> : <><PlayCircle className="h-3.5 w-3.5" /> Activate</>}
          </button>
          <button onClick={async () => {
              if (!confirm("Delete this restaurant and its owner login?")) return;
              await del({ data: { id } }); toast.success("Deleted"); navigate({ to: "/admin/restaurants" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-full border border-border p-1">
        {(["menu", "branding", "qr", "settings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition ${
              tab === t ? "bg-[oklch(0.82_0.13_88_/_0.15)] text-foreground ring-gold" : "text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </nav>

      {tab === "menu" && <MenuManager restaurantId={id} categories={data.categories} items={data.items} canEditCategories />}
      {tab === "branding" && <BrandingEditor r={r} onSaved={() => qc.invalidateQueries({ queryKey: ["restaurant", id] })} update={updateMeta} />}
      {tab === "qr" && (
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          <QrPanel slug={r.slug} name={r.name} />
          <div className="card-luxe space-y-3 p-6">
            <h3 className="font-display text-xl">Permanent QR</h3>
            <p className="text-sm text-muted-foreground">This QR never changes. Menu updates are live — customers always scan the same code.</p>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total scans</span>
              <span className="font-display text-xl">{data.scans.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      {tab === "settings" && (
        <div className="card-luxe space-y-6 p-6">
          <div>
            <h3 className="font-display text-xl">Owner account</h3>
            <p className="text-sm text-muted-foreground">Email: <span className="text-foreground">{r.owner_email}</span></p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[220px] block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">New password</span>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={8}
                className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.13_88_/_0.5)]" />
            </label>
            <button onClick={async () => {
              if (newPw.length < 8) { toast.error("Min 8 chars"); return; }
              try { await resetPw({ data: { id, new_password: newPw } }); setNewPw(""); toast.success("Password updated"); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }} className="btn-gold inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm">
              <KeyRound className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandingEditor({ r, onSaved, update }: { r: any; onSaved: () => void; update: any }) {
  const [name, setName] = useState(r.name);
  const [slug, setSlug] = useState(r.slug);
  const [welcome, setWelcome] = useState(r.welcome_message ?? "");
  const [description, setDescription] = useState(r.description ?? "");
  const [primary, setPrimary] = useState(r.primary_color);
  const [secondary, setSecondary] = useState(r.secondary_color);
  const [logo, setLogo] = useState<string | null>(r.logo_url);
  const [banner, setBanner] = useState<string | null>(r.banner_url);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await update({ data: {
        id: r.id, name, slug, welcome_message: welcome, description,
        primary_color: primary, secondary_color: secondary,
        logo_url: logo, banner_url: banner,
      }});
      toast.success("Saved"); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="card-luxe space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><ImageUploader label="Logo" value={logo} onChange={setLogo} aspect="square" /></div>
        <div><ImageUploader label="Banner" value={banner} onChange={setBanner} aspect="banner" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Restaurant name" value={name} onChange={setName} />
        <Text label="Slug" value={slug} onChange={setSlug} />
        <Text label="Welcome message" value={welcome} onChange={setWelcome} className="sm:col-span-2" />
        <Text label="Description" value={description} onChange={setDescription} className="sm:col-span-2" />
        <Text label="Primary color" value={primary} onChange={setPrimary} type="color" />
        <Text label="Secondary color" value={secondary} onChange={setSecondary} type="color" />
      </div>
      <button onClick={save} disabled={busy} className="btn-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm">
        <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function Text(props: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${props.className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <input type={props.type ?? "text"} value={props.value} onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.13_88_/_0.5)]" />
    </label>
  );
}

export function MenuManager({ restaurantId, categories, items, canEditCategories }: {
  restaurantId: string; categories: any[]; items: any[]; canEditCategories: boolean;
}) {
  const qc = useQueryClient();
  const [activeCat, setActiveCat] = useState<string | null>(categories[0]?.id ?? null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
  const invalidateOwner = () => qc.invalidateQueries({ queryKey: ["my-menu"] });

  const addCat = useMutation({
    mutationFn: async () => {
      if (!newCatName.trim()) throw new Error("Name required");
      const { error } = await supabase.from("categories").insert({
        restaurant_id: restaurantId, name: newCatName.trim(), emoji: newCatEmoji || null,
        sort_order: categories.length,
      });
      if (error) throw error;
    },
    onSuccess: () => { setNewCatName(""); setNewCatEmoji(""); invalidate(); invalidateOwner(); toast.success("Category added"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteCat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); invalidateOwner(); toast.success("Category deleted"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const active = activeCat ?? categories[0]?.id ?? null;
  const catItems = items.filter((i) => i.category_id === active);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Category rail */}
      <aside className="card-luxe p-3">
        <p className="px-2 pb-2 text-xs uppercase tracking-widest text-muted-foreground">Categories</p>
        {categories.length === 0 && (
          <p className="p-3 text-xs text-muted-foreground">
            {canEditCategories ? "Create your first category below." : "No categories yet."}
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {categories.map((c) => (
            <li key={c.id} className="group flex items-center">
              <button onClick={() => setActiveCat(c.id)}
                className={`flex-1 rounded-xl px-3 py-2 text-left text-sm transition ${
                  active === c.id ? "bg-[oklch(0.82_0.13_88_/_0.12)] ring-gold" : "hover:bg-white/5"
                }`}>
                <span className="mr-2">{c.emoji ?? "🍽️"}</span>{c.name}
              </button>
              {canEditCategories && (
                <button onClick={() => { if (confirm(`Delete "${c.name}" and its items?`)) deleteCat.mutate(c.id); }}
                  className="ml-1 rounded-lg p-1.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-red-400" aria-label="Delete">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {canEditCategories && (
          <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
            <div className="flex gap-2">
              <input value={newCatEmoji} onChange={(e) => setNewCatEmoji(e.target.value)} placeholder="🍕" maxLength={3}
                className="w-14 rounded-lg border border-border bg-black/20 px-2 py-1.5 text-center text-sm outline-none" />
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name"
                className="flex-1 rounded-lg border border-border bg-black/20 px-2 py-1.5 text-sm outline-none" />
            </div>
            <button onClick={() => addCat.mutate()} disabled={addCat.isPending}
              className="btn-gold inline-flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add category
            </button>
          </div>
        )}
      </aside>

      {/* Items */}
      <section className="space-y-4">
        {active ? (
          <ItemList restaurantId={restaurantId} categoryId={active} items={catItems} onChanged={() => { invalidate(); invalidateOwner(); }} />
        ) : (
          <div className="card-luxe p-10 text-center text-sm text-muted-foreground">
            {canEditCategories ? "Add a category to start building your menu." : "No categories are available yet. Ask your Super Admin to create pages."}
          </div>
        )}
      </section>
    </div>
  );
}

function ItemList({ restaurantId, categoryId, items, onChanged }: {
  restaurantId: string; categoryId: string; items: any[]; onChanged: () => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Menu items</h2>
        <button onClick={() => setEditing("new")} className="btn-gold inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>

      {editing === "new" && (
        <ItemForm restaurantId={restaurantId} categoryId={categoryId}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && editing !== "new" && (
          <div className="col-span-full card-luxe p-8 text-center text-sm text-muted-foreground">
            No items in this category yet.
          </div>
        )}
        {items.map((i) => (
          editing === i.id ? (
            <div key={i.id} className="sm:col-span-2 xl:col-span-3">
              <ItemForm restaurantId={restaurantId} categoryId={categoryId} item={i}
                onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />
            </div>
          ) : (
            <div key={i.id} className="card-luxe overflow-hidden">
              {i.image_url && <img src={i.image_url} alt="" className="h-32 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{i.description || ""}</p>
                  </div>
                  <p className="whitespace-nowrap gold-text font-display text-lg">
                    {Number(i.price).toFixed(2)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {i.out_of_stock && <Tag>Out of stock</Tag>}
                  {i.is_special && <Tag>Today's Special</Tag>}
                  {i.is_bestseller && <Tag>Best Seller</Tag>}
                  {!i.available && <Tag>Hidden</Tag>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={() => setEditing(i.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={async () => {
                    if (!confirm("Delete this item?")) return;
                    const { error } = await supabase.from("menu_items").delete().eq("id", i.id);
                    if (error) toast.error(error.message); else { toast.success("Deleted"); onChanged(); }
                  }} className="text-xs text-red-300/70 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[oklch(0.82_0.13_88_/_0.3)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[oklch(0.82_0.13_88)]">{children}</span>;
}

function ItemForm({ restaurantId, categoryId, item, onClose, onSaved }: {
  restaurantId: string; categoryId: string; item?: any; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState<string>(item?.price?.toString() ?? "0");
  const [description, setDescription] = useState(item?.description ?? "");
  const [image, setImage] = useState<string | null>(item?.image_url ?? null);
  const [available, setAvailable] = useState<boolean>(item?.available ?? true);
  const [outOfStock, setOutOfStock] = useState<boolean>(item?.out_of_stock ?? false);
  const [isSpecial, setIsSpecial] = useState<boolean>(item?.is_special ?? false);
  const [isBestseller, setIsBestseller] = useState<boolean>(item?.is_bestseller ?? false);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    try {
      const payload = {
        restaurant_id: restaurantId, category_id: categoryId,
        name: name.trim(), price: Number(price) || 0,
        description: description || null, image_url: image,
        available, out_of_stock: outOfStock, is_special: isSpecial, is_bestseller: isBestseller,
      };
      const { error } = item?.id
        ? await supabase.from("menu_items").update(payload).eq("id", item.id)
        : await supabase.from("menu_items").insert(payload);
      if (error) throw error;
      toast.success("Saved"); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="card-luxe p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">{item ? "Edit item" : "New item"}</h3>
        <button onClick={onClose} className="rounded-full border border-border p-1.5"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <ImageUploader label="Photo (optional)" value={image} onChange={setImage} />
        <div className="grid gap-3">
          <Text label="Name" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <Text label="Price" value={price} onChange={setPrice} />
            <div className="flex items-end">
              <Toggle label="Available" checked={available} onChange={setAvailable} />
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Description</span>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.13_88_/_0.5)]" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Toggle label="Out of stock" checked={outOfStock} onChange={setOutOfStock} />
            <Toggle label="Today's Special" checked={isSpecial} onChange={setIsSpecial} />
            <Toggle label="Best Seller" checked={isBestseller} onChange={setIsBestseller} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-xs">Cancel</button>
        <button onClick={save} disabled={busy} className="btn-gold rounded-full px-5 py-2 text-xs">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        checked ? "border-[oklch(0.82_0.13_88_/_0.5)] bg-[oklch(0.82_0.13_88_/_0.12)] text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
      }`}>
      <span className={`h-2 w-2 rounded-full ${checked ? "bg-[oklch(0.82_0.13_88)]" : "bg-muted-foreground/40"}`} />
      {label}
    </button>
  );
}
