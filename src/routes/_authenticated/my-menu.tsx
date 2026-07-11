import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, Star, AlertCircle, TrendingUp,
  ImagePlus, X, Check, ChevronDown, Search, Package,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/my-menu")({
  component: MyMenu,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  outOfStock: boolean;
  todaySpecial: boolean;
  bestSeller: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyMenu() {
  const [items, setItems] = useState<FoodItem[]>([
    { id: "1", name: "Butter Chicken", description: "Creamy tomato-based curry", price: 380, category: "Mains", outOfStock: false, todaySpecial: true, bestSeller: true },
    { id: "2", name: "Paneer Tikka", description: "Grilled cottage cheese with spices", price: 290, category: "Starters", outOfStock: false, todaySpecial: false, bestSeller: false },
    { id: "3", name: "Biryani", description: "Aromatic rice with saffron", price: 420, category: "Mains", outOfStock: true, todaySpecial: false, bestSeller: true },
  ]);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  function toggleFlag(id: string, flag: "outOfStock" | "todaySpecial" | "bestSeller") {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [flag]: !item[flag] } : item
      )
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed");
  }

  function saveItem(data: Omit<FoodItem, "id"> & { id?: string }) {
    if (data.id) {
      setItems((prev) => prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)));
      toast.success("Item updated");
    } else {
      setItems((prev) => [
        ...prev,
        { ...data, id: `item_${Date.now()}` },
      ]);
      toast.success("Item added");
    }
    setEditing(null);
    setAdding(false);
  }

  // ── Form open ──────────────────────────────────────────────────────────────
  if (adding || editing) {
    return (
      <ItemForm
        item={editing ?? undefined}
        onSave={saveItem}
        onClose={() => { setEditing(null); setAdding(false); }}
      />
    );
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#080808]/95 backdrop-blur-xl">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg tracking-tight">My Menu</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5">
                {items.length} items
              </p>
            </div>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-medium text-black transition active:scale-95 hover:bg-white/90"
            >
              <Plus size={15} /> Add Food
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Stat label="Total" value={items.length} />
            <Stat label="Live" value={items.filter((i) => !i.outOfStock).length} accent />
            <Stat label="Specials" value={items.filter((i) => i.todaySpecial).length} />
            <Stat label="Best Sellers" value={items.filter((i) => i.bestSeller).length} />
          </div>
        </div>

        {/* Search + categories */}
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-wider transition ${activeCategory === cat ? "bg-white text-black" : "border border-white/12 text-white/45 hover:border-white/25"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="px-4 py-4 sm:px-6">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <Package size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/30">No items found</p>
              <button
                onClick={() => setAdding(true)}
                className="mt-4 rounded-full border border-white/15 px-4 py-2 text-[12px] text-white/50 transition hover:border-white/30"
              >
                Add your first item
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <FoodCard
                    item={item}
                    onEdit={() => setEditing(item)}
                    onDelete={() => deleteItem(item.id)}
                    onToggle={(flag) => toggleFlag(item.id, flag)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────

function FoodCard({
  item, onEdit, onDelete, onToggle,
}: {
  item: FoodItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (flag: "outOfStock" | "todaySpecial" | "bestSeller") => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition ${item.outOfStock ? "border-red-500/20 bg-red-500/5" : "border-white/8 bg-white/[0.03]"}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Image placeholder */}
        <div
          className="h-16 w-16 flex-shrink-0 rounded-xl bg-white/8 flex items-center justify-center overflow-hidden"
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={18} className="text-white/20" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">{item.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/40">{item.description}</p>
            </div>
            <span className="flex-shrink-0 text-[15px] font-semibold text-[#FFD700]">
              ₹{item.price}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.bestSeller && <Tag color="gold">Best Seller</Tag>}
            {item.todaySpecial && <Tag color="blue">Today's Special</Tag>}
            {item.outOfStock && <Tag color="red">Out of Stock</Tag>}
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-1 border-t border-white/6 px-3 py-2.5 overflow-x-auto scrollbar-hide">
        <ActionBtn
          icon={<TrendingUp size={12} />}
          label="Best Seller"
          active={item.bestSeller}
          activeColor="text-[#FFD700]"
          onClick={() => onToggle("bestSeller")}
        />
        <ActionBtn
          icon={<Star size={12} />}
          label="Today's Special"
          active={item.todaySpecial}
          activeColor="text-blue-400"
          onClick={() => onToggle("todaySpecial")}
        />
        <ActionBtn
          icon={<AlertCircle size={12} />}
          label="Out of Stock"
          active={item.outOfStock}
          activeColor="text-red-400"
          onClick={() => onToggle("outOfStock")}
        />
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-[11px] text-white/50 transition hover:border-white/25 hover:text-white"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 rounded-xl border border-red-500/20 px-3 py-1.5 text-[11px] text-red-400/60 transition hover:border-red-500/40 hover:text-red-400"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Form (Add / Edit) ───────────────────────────────────────────────────

function ItemForm({
  item, onSave, onClose,
}: {
  item?: FoodItem;
  onSave: (data: Omit<FoodItem, "id"> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(String(item?.price ?? ""));
  const [category, setCategory] = useState(item?.category ?? "Mains");
  const [outOfStock, setOutOfStock] = useState(item?.outOfStock ?? false);
  const [todaySpecial, setTodaySpecial] = useState(item?.todaySpecial ?? false);
  const [bestSeller, setBestSeller] = useState(item?.bestSeller ?? false);

  const isValid = name.trim() && Number(price) > 0;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#080808]/95 px-4 py-4 backdrop-blur-xl">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70">
          <X size={15} /> Cancel
        </button>
        <h2 className="text-[14px] font-medium">{item ? "Edit Item" : "Add New Item"}</h2>
        <button
          onClick={() => {
            if (!isValid) return;
            onSave({
              id: item?.id,
              name: name.trim(),
              description: description.trim(),
              price: Number(price),
              category,
              outOfStock,
              todaySpecial,
              bestSeller,
            });
          }}
          disabled={!isValid}
          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-[12px] font-medium text-black transition disabled:opacity-30 hover:bg-white/90"
        >
          <Check size={13} /> Save
        </button>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Image upload placeholder */}
        <div className="flex h-36 items-center justify-center rounded-2xl border-2 border-dashed border-white/12 bg-white/3 transition hover:border-white/25 cursor-pointer">
          <div className="text-center">
            <ImagePlus size={24} className="mx-auto mb-2 text-white/25" />
            <p className="text-[11px] text-white/35">Tap to upload food photo</p>
          </div>
        </div>

        <Field label="Item Name *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Butter Chicken"
            className="input-field"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description…"
            rows={2}
            className="input-field resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹) *">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="input-field"
            />
          </Field>
          <Field label="Category">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Mains"
              className="input-field"
            />
          </Field>
        </div>

        {/* Flags */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] uppercase tracking-widest text-white/35">Flags</p>
          <FlagToggle
            icon={<TrendingUp size={14} />}
            label="Best Seller"
            value={bestSeller}
            onChange={setBestSeller}
            color="#FFD700"
          />
          <FlagToggle
            icon={<Star size={14} />}
            label="Today's Special"
            value={todaySpecial}
            onChange={setTodaySpecial}
            color="#60A5FA"
          />
          <FlagToggle
            icon={<AlertCircle size={14} />}
            label="Out of Stock"
            value={outOfStock}
            onChange={setOutOfStock}
            color="#F87171"
          />
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(255,255,255,0.25);
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex-shrink-0 rounded-2xl border border-white/8 bg-white/3 px-4 py-2.5 text-center">
      <p className={`text-lg font-semibold ${accent ? "text-[#FFD700]" : "text-white"}`}>{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: "gold" | "blue" | "red" }) {
  const colors = {
    gold: "border-yellow-500/30 text-yellow-400/80",
    blue: "border-blue-500/30 text-blue-400/80",
    red: "border-red-500/30 text-red-400/80",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
}

function ActionBtn({
  icon, label, active, activeColor, onClick,
}: {
  icon: React.ReactNode; label: string; active: boolean;
  activeColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-wider transition ${active ? `bg-white/8 ${activeColor}` : "text-white/30 hover:text-white/60"}`}
    >
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

function FlagToggle({
  icon, label, value, onChange, color,
}: {
  icon: React.ReactNode; label: string; value: boolean;
  onChange: (v: boolean) => void; color: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${value ? "border-white/20 bg-white/6" : "border-white/8 bg-white/3"}`}
    >
      <div className="flex items-center gap-2.5" style={{ color: value ? color : "rgba(255,255,255,0.5)" }}>
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors`}
        style={{ background: value ? color : "rgba(255,255,255,0.15)" }}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
    </button>
  );
}
