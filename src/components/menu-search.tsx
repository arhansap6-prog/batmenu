import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  category_id?: string | null;
  is_special?: boolean | null;
  is_bestseller?: boolean | null;
  out_of_stock?: boolean | null;
};

type Category = { id: string; name: string };

export function MenuSearch({
  items,
  categories,
  accent = "#FFD700",
  onOpenItem,
}: {
  items: SearchableItem[];
  categories: Category[];
  accent?: string;
  onOpenItem: (item: SearchableItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 300ms debounce
  useEffect(() => {
    const t = setTimeout(() => setQ(raw.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [raw]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const catMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const results = useMemo(() => {
    if (!q) return [];
    return items.filter((i) => {
      const cat = i.category_id ? catMap.get(i.category_id) ?? "" : "";
      return (
        i.name.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      );
    }).slice(0, 60);
  }, [q, items, catMap]);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search menu"
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/70 active:scale-95 sm:right-6 sm:top-6"
      >
        <Search size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search bar */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-b border-white/10 bg-black/50 px-4 py-4 backdrop-blur-2xl sm:px-8"
            >
              <div className="mx-auto flex max-w-2xl items-center gap-3">
                <div
                  className="flex flex-1 items-center gap-2.5 rounded-2xl border bg-white/5 px-4 py-3 backdrop-blur transition focus-within:border-white/40"
                  style={{ borderColor: raw ? `${accent}66` : "rgba(255,255,255,0.15)" }}
                >
                  <Search size={16} className="text-white/50" />
                  <input
                    ref={inputRef}
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder="Search foods…"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                  {raw && (
                    <button
                      onClick={() => setRaw("")}
                      className="rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
                      aria-label="Clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest text-white/70 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              {q && (
                <p className="mx-auto mt-2 max-w-2xl text-[11px] uppercase tracking-widest text-white/40">
                  {results.length === 0
                    ? "No foods match your search"
                    : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
                </p>
              )}
            </motion.div>

            {/* Results */}
            <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4 sm:px-8">
              {!q && (
                <div className="pt-16 text-center text-white/40">
                  <Search size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Type to search foods, descriptions, or categories.</p>
                </div>
              )}

              <ul className="space-y-2">
                {results.map((i) => {
                  const cat = i.category_id ? catMap.get(i.category_id) : undefined;
                  return (
                    <li key={i.id}>
                      <button
                        onClick={() => { setOpen(false); onOpenItem(i); }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-white/25 hover:bg-white/10 active:scale-[0.99]"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                          {i.image_url ? (
                            <img src={i.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/25 font-display text-xl">
                              {i.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-medium text-white">
                              {highlight(i.name, q)}
                            </p>
                            <span className="whitespace-nowrap font-display text-sm tabular-nums" style={{ color: accent }}>
                              {Number(i.price).toFixed(2)}
                            </span>
                          </div>
                          {cat && (
                            <p className="text-[10px] uppercase tracking-widest text-white/35">{cat}</p>
                          )}
                          {i.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                              {highlight(i.description, q)}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-400/30 px-0.5 text-white">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
