import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";

export function ImageUploader({ value, onChange, label, className, aspect = "square" }: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label: string;
  className?: string;
  aspect?: "square" | "banner";
}) {
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("restaurant-assets").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: signed, error: signErr } = await supabase.storage
        .from("restaurant-assets").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signErr) throw signErr;
      onChange(signed.signedUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setBusy(false); e.target.value = ""; }
  }

  const box = aspect === "banner" ? "aspect-[16/6]" : "aspect-square";

  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className={`relative ${box} w-full overflow-hidden rounded-2xl border border-dashed border-border bg-black/20 transition hover:border-[oklch(0.82_0.13_88_/_0.5)]`}>
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span>Click to upload</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-[oklch(0.82_0.13_88)]" />
          </div>
        )}
        <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={onFile} />
      </div>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="mt-2 text-[11px] text-muted-foreground hover:text-foreground">Remove</button>
      )}
    </label>
  );
}
