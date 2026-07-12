import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, Star, AlertCircle, TrendingUp,
  X, Check, Search, Package, Loader2, FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/image-uploader";

export const Route = createFileRoute("/_authenticated/my-menu")({
  component: MyMenu,
});

type Category = { id: string; name: string; sort_order: number };
type Item = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  out_of_stock: boolean;
  is_special: boolean;
  is_bestseller: boolean;
  available: boolean;
  sort_order: number;
};

function MyMenu() {
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [editing, setEditing] = useState<Item | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingCat, setAddingCat] = useState(false);

  useEffect(() => { void bootstrap(); }, []);

  async function bootstrap() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: rest, error } = await supabase
      .from("restaurants").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (!rest) { setLoading(false); return; }
    setRestaurantId(rest.id);
    await Promise.all([loadCats(rest.id), loadItems(rest.id)]);
    setLoading(false);
  }

  async function loadCats(rid: string) {
    const { data, error } = await supabase.from("categories")
      .select("id,name,sort_order").eq("restaurant_id", rid).order("sort_order");
    if (error) return toast.error(error.message);
    setCats(data ?? []);
  }
  async function loadItems(rid: string) {
    const { data, error } = await supabase.from("menu_items")
      .select("*").eq("restaurant_id", rid).order("sort_order");
    if (error) return toast.error(error.message);
    setItems((data ?? []) as Item[]);
  }

  const filtered = useMemo(() => items.filter((i) => {
    const s = i.name.toLowerCase().includes(search.toLowerCase());
    const c = activeCat === "all" || i.category_id === activeCat;
    return s && c;
  }), [items, search, activeCat]);

  async function toggleFlag(item: Item, flag: "out_of_stock" | "is_special" | "is_bestseller") {
    const next = { ...item, [flag]: !item[flag] };
    setItems((prev) => prev.map((x) => (x.id === item.id ? next : x)));
    const { error } = await supabase.from("menu_items").update({ [flag]: next[flag] }).eq("id", item.id);
    if (error) { toast.error(error.message); setItems((prev) => prev.map((x) => (x.id === item.id ? item : x))); }
  }

  async function deleteItem(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const prev = items;
    setItems((p) => p.filter((x) => x.id !== item.id));
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) { toast.error(error.message); setItems(prev); return; }
    toast.success("Item removed");
  }

  async function saveItem(payload: {
    id?: string; name: string; description: string; price: number;
    category_id: string; image_url: string | null;
    out_of_stock: boolean; is_special: boolean; is_bestseller: boolean;
  }) {
    if (!restaurantId) return;
    if (payload.id) {
      const { data, error } = await supabase.from("menu_items")
        .update({
          name: payload.name, description: payload.description, price: payload.price,
          category_id: payload.category_id, image_url: payload.image_url,
          out_of_stock: payload.out_of_stock, is_special: payload.is_special, is_bestseller: payload.is_bestseller,
        }).eq("id", payload.id).select().single();
      if (error) return toast.error(error.message);
      setItems((prev) => prev.map((x) => (x.id === data.id ? (data as Item) : x)));
      toast.success("Item updated");
    } else {
      const nextSort = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      const { data, error } = await supabase.from("menu_items").insert({
        restaurant_id: restaurantId,
        category_id: payload.category_id,
        name: payload.name, description: payload.description, price: payload.price,
        image_url: payload.image_url,
        out_of_stock: payload.out_of_stock, is_special: payload.is_special, is_bestseller: payload.is_bestseller,
        available: true, sort_order: nextSort,
      }).select().single();
      if (error) return toast.error(error.message);
      setItems((prev) => [...prev, data as Item]);
      toast.success("Item added");
    }
    setEditing(null); setAdding(false);
  }

  async function addCategory(name: string) {
    if (!restaurantId || !name.trim()) return;
    const nextSort = cats.length ? Math.max(...cats.map((c) => c.sort_order)) + 1 : 0;
    const { data, error } = await supabase.from("categories")
      .insert({ restaurant_id: restaurantId, name: name.trim(), sort_order: nextSort })
      .select("id,name,sort_order").single();
    if (error) return toast.error(error.message);
    setCats((p) => [...p, data as Category]);
    toast.success("Category added");
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  // ── No restaurant assigned ──
  if (!restaurantId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-center text-white">
        <div>
          <Package className="mx-auto mb-4 h-8 w-8 text-white/30" />
          <h2 className="mb-2 font-display text-lg">No restaurant yet</h2>
          <p className="max-w-xs text-[12px] text-white/40">
            Your account has no restaurant linked. Ask a Super Admin to create one for you.
          </p>
        </div>
      </div>
    );
  }

  // ── Form open ──
  if (adding || editing) {
    return (
      <ItemForm
        item={editing ?? undefined}
        categories={cats}
        onAddCategory={addCategory}
        onSave={saveItem}
        onClose={() => { setEditing(null); setAdding(false); }}
      />
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#080808]/95 backdrop-blur-xl">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg tracking-tight">My Menu</h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">{items.length} items</p>
            </div>
            <button
              onClick={() => { if (!cats.length) { toast.error("Add a category first"); setAddingCat(true); return; } setAdding(true); }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black transition active:scale-95 hover:bg-white/90"
            >
              <Plus size={15} /> Add Food
            </button>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Stat label="Total" value={items.length} />
            <Stat label="Live" value={items.filter((i) => !i.out_of_stock).length} accent />
            <Stat label="Specials" value={items.filter((i) => i.is_special).length} />
            <Stat label="Best Sellers" value={items.filter((i) => i.is_bestseller).length} />
          </div>
        </div>

        <div className="border-t border-white/5 px-4 py-3 sm:px-6">
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-8 pr-3 text-[13px] outline-none placeholder:text-white/25 focus:border-white/25"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Chip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Chip>
            {cats.map((c) => (
              <Chip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>{c.name}</Chip>
            ))}
            <button
              onClick={() => setAddingCat(true)}
              className="flex-shrink-0 rounded-full border border-dashed border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/45 hover:border-white/30"
            >
              <FolderPlus size={11} className="inline mr-1" /> Category
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <Package size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/30">No items yet</p>
              <button
                onClick={() => { if (!cats.length) setAddingCat(true); else setAdding(true); }}
                className="mt-4 rounded-full border border-white/15 px-4 py-2 text-[12px] text-white/50 transition hover:border-white/30"
              >
                Add your first item
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                  <FoodCard
                    item={item}
                    categoryName={cats.find((c) => c.id === item.category_id)?.name ?? "—"}
                    onEdit={() => setEditing(item)}
                    onDelete={() => deleteItem(item)}
                    onToggle={(f) => toggleFlag(item, f)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Category modal */}
      <AnimatePresence>
        {addingCat && (
          <CategoryModal onClose={() => setAddingCat(false)} onAdd={async (n) => { await addCategory(n); setAddingCat(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────

function FoodCard({
  item, categoryName, onEdit, onDelete, onToggle,
}: {
  item: Item; categoryName: string;
  onEdit: () => void; onDelete: () => void;
  onToggle: (flag: "out_of_stock" | "is_special" | "is_bestseller") => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition ${item.out_of_stock ? "border-red-500/20 bg-red-500/5" : "border-white/8 bg-white/[0.03]"}`}>
      <div className="flex items-start gap-3 p-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white/8">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/25">No image</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{item.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/40">{item.description ?? categoryName}</p>
            </div>
            <span className="flex-shrink-0 text-[15px] font-semibold text-[#FFD700]">₹{item.price}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag color="neutral">{categoryName}</Tag>
            {item.is_bestseller && <Tag color="gold">Best Seller</Tag>}
            {item.is_special && <Tag color="blue">Today's Special</Tag>}
            {item.out_of_stock && <Tag color="red">Out of Stock</Tag>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto border-t border-white/6 px-3 py-2.5 scrollbar-hide">
        <ActionBtn icon={<TrendingUp size={12} />} label="Best" active={item.is_bestseller} activeColor="text-[#FFD700]" onClick={() => onToggle("is_bestseller")} />
        <ActionBtn icon={<Star size={12} />} label="Special" active={item.is_special} activeColor="text-blue-400" onClick={() => onToggle("is_special")} />
        <ActionBtn icon={<AlertCircle size={12} />} label="Out" active={item.out_of_stock} activeColor="text-red-400" onClick={() => onToggle("out_of_stock")} />
        <div className="ml-auto flex flex-shrink-0 items-center gap-1">
          <button onClick={onEdit} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-[11px] text-white/50 transition hover:border-white/25 hover:text-white">
            <Pencil size={11} /> Edit
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 rounded-xl border border-red-500/20 px-3 py-1.5 text-[11px] text-red-400/60 transition hover:border-red-500/40 hover:text-red-400">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Form ────────────────────────────────────────────────────────────────

function ItemForm({
  item, categories, onSave, onClose, onAddCategory,
}: {
  item?: Item;
  categories: Category[];
  onAddCategory: (name: string) => Promise<void>;
  onSave: (payload: {
    id?: string; name: string; description: string; price: number;
    category_id: string; image_url: string | null;
    out_of_stock: boolean; is_special: boolean; is_bestseller: boolean;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image_url ?? null);
  const [outOfStock, setOutOfStock] = useState(item?.out_of_stock ?? false);
  const [isSpecial, setIsSpecial] = useState(item?.is_special ?? false);
  const [isBestseller, setIsBestseller] = useState(item?.is_bestseller ?? false);
  const [saving, setSaving] = useState(false);

  const isValid = name.trim() && Number(price) > 0 && categoryId;

  async function submit() {
    if (!isValid || saving) return;
    setSaving(true);
    await onSave({
      id: item?.id, name: name.trim(), description: description.trim(), price: Number(price),
      category_id: categoryId, image_url: imageUrl,
      out_of_stock: outOfStock, is_special: isSpecial, is_bestseller: isBestseller,
    });
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#080808]/95 px-4 py-4 backdrop-blur-xl">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70">
          <X size={15} /> Cancel
        </button>
        <h2 className="text-[14px] font-medium">{item ? "Edit Item" : "Add New Item"}</h2>
        <button
          onClick={submit}
          disabled={!isValid || saving}
          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12px] font-medium text-black transition hover:bg-white/90 disabled:opacity-30"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
        </button>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <ImageUploader value={imageUrl} onChange={setImageUrl} label="Food photo" aspect="banner" />

        <Field label="Item name *">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Butter Chicken" className="input-field" />
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" rows={2} className="input-field resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹) *">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="input-field" />
          </Field>
          <Field label="Category *">
            <select value={categoryId} onChange={(e) => {
              if (e.target.value === "__new__") {
                const n = prompt("New category name");
                if (n) void onAddCategory(n);
                return;
              }
              setCategoryId(e.target.value);
            }} className="input-field">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="__new__">＋ New category…</option>
            </select>
          </Field>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-[10px] uppercase tracking-widest text-white/35">Flags</p>
          <FlagToggle icon={<TrendingUp size={14} />} label="Best Seller" value={isBestseller} onChange={setIsBestseller} color="#FFD700" />
          <FlagToggle icon={<Star size={14} />} label="Today's Special" value={isSpecial} onChange={setIsSpecial} color="#60A5FA" />
          <FlagToggle icon={<AlertCircle size={14} />} label="Out of Stock" value={outOfStock} onChange={setOutOfStock} color="#F87171" />
        </div>
      </div>

      <style>{`
        .input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 10px 12px; font-size: 13px; color: white; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(255,255,255,0.25); }
        .input-field::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}

// ─── Category modal ──
function CategoryModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur px-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0e0e] p-6">
        <h3 className="mb-4 font-display text-lg text-white">New category</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Starters"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-[12px] text-white/50 hover:text-white">Cancel</button>
          <button
            disabled={!name.trim() || busy}
            onClick={async () => { setBusy(true); await onAdd(name); setBusy(false); }}
            className="rounded-xl bg-white px-4 py-2 text-[12px] font-medium text-black disabled:opacity-40"
          >{busy ? "Adding…" : "Add"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helpers ──
function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex-shrink-0 rounded-2xl border border-white/8 bg-white/3 px-4 py-2.5 text-center">
      <p className={`text-lg font-semibold ${accent ? "text-[#FFD700]" : "text-white"}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
    </div>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-wider transition ${active ? "bg-white text-black" : "border border-white/12 text-white/45 hover:border-white/25"}`}>
      {children}
    </button>
  );
}
function Tag({ children, color }: { children: React.ReactNode; color: "gold" | "blue" | "red" | "neutral" }) {
  const c = {
    gold: "border-yellow-500/30 text-yellow-400/80",
    blue: "border-blue-500/30 text-blue-400/80",
    red: "border-red-500/30 text-red-400/80",
    neutral: "border-white/15 text-white/45",
  }[color];
  return <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${c}`}>{children}</span>;
}
function ActionBtn({ icon, label, active, activeColor, onClick }: { icon: React.ReactNode; label: string; active: boolean; activeColor: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-wider transition ${active ? `bg-white/8 ${activeColor}` : "text-white/30 hover:text-white/60"}`}>
      {icon} {label}
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      {children}
    </div>
  );
}
function FlagToggle({ icon, label, value, onChange, color }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${value ? "border-white/20 bg-white/6" : "border-white/8 bg-white/3"}`}>
      <div className="flex items-center gap-2.5" style={{ color: value ? color : "rgba(255,255,255,0.5)" }}>
        {icon}<span className="text-[13px]">{label}</span>
      </div>
      <div className="relative h-6 w-11 rounded-full transition-colors" style={{ background: value ? color : "rgba(255,255,255,0.15)" }}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}
