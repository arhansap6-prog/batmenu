import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Sparkles, Flame, PackageX } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export type MenuItemDetail = {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  is_special?: boolean | null;
  is_bestseller?: boolean | null;
  out_of_stock?: boolean | null;
  category_name?: string | null;
};

export function FoodDetailModal({
  item,
  restaurantName,
  accent = "#FFD700",
  onClose,
}: {
  item: MenuItemDetail | null;
  restaurantName: string;
  accent?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  async function share() {
    if (!item) return;
    const text = `${item.name} — ${restaurantName}\n${item.description ?? ""}`;
    try {
      if (navigator.share) await navigator.share({ title: item.name, text });
      else { await navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); }
    } catch { /* cancelled */ }
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => { if (info.offset.y > 140) onClose(); }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-[#0b0b0b] text-white shadow-2xl sm:rounded-3xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/25" />
            </div>

            {/* Image */}
            <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
              {item.image_url ? (
                <motion.img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.08, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/20">
                  <span className="font-display text-6xl">{item.name.charAt(0)}</span>
                </div>
              )}

              {item.out_of_stock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
                  <div className="rounded-full border border-red-400/50 bg-red-500/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-100">
                    Out of stock
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70 active:scale-95"
              >
                <X size={16} />
              </button>

              <div className="absolute right-3 top-3 flex gap-2">
                {item.is_bestseller && (
                  <Badge tone="amber" icon={<Flame size={11} />} label="Best seller" />
                )}
                {item.is_special && (
                  <Badge tone="gold" icon={<Sparkles size={11} />} label="Today's special" />
                )}
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {item.category_name && (
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {item.category_name}
                </div>
              )}
              <div className="mt-1 flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight text-white">{item.name}</h2>
                <div
                  className="whitespace-nowrap font-display text-2xl tabular-nums"
                  style={{ color: accent }}
                >
                  {Number(item.price).toFixed(2)}
                </div>
              </div>

              {item.description && (
                <p className="mt-4 text-sm leading-relaxed text-white/70">{item.description}</p>
              )}

              {item.out_of_stock && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  <PackageX size={14} /> Currently unavailable.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-white/8 bg-black/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-white/12 bg-white/5 py-3 text-[12px] uppercase tracking-widest text-white/70 transition hover:bg-white/10 active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  onClick={share}
                  className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[12px] font-semibold uppercase tracking-widest text-black transition active:scale-[0.98]"
                  style={{ background: accent, boxShadow: `0 10px 30px ${accent}55` }}
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Badge({
  tone, icon, label,
}: { tone: "amber" | "gold"; icon: React.ReactNode; label: string }) {
  const styles = tone === "gold"
    ? "border-yellow-300/40 bg-yellow-400/20 text-yellow-100"
    : "border-orange-400/40 bg-orange-500/20 text-orange-100";
  return (
    <div className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur ${styles}`}>
      {icon} {label}
    </div>
  );
}
