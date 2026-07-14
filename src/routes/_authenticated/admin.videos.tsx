import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/videos")({
  component: VideosManager,
});

type PromoVideo = {
  id: string;
  video_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  format: string | null;
  enabled: boolean;
  show_skip_button: boolean;
  created_at: string;
};

function VideosManager() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: videos } = useQuery({
    queryKey: ["promo-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotional_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PromoVideo[];
    },
  });

  const active = videos?.find((v) => v.enabled) ?? videos?.[0] ?? null;

  useEffect(() => {
    let cancelled = false;
    async function makeUrl() {
      if (!active) { setPreviewUrl(null); return; }
      const { data } = await supabase.storage.from("promo-videos").createSignedUrl(active.video_url, 3600);
      if (!cancelled) setPreviewUrl(data?.signedUrl ?? null);
    }
    makeUrl();
    return () => { cancelled = true; };
  }, [active?.id]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please choose a video file"); return; }
    if (file.size > 500 * 1024 * 1024) { toast.error("Max 500 MB"); return; }
    setUploading(true); setProgress(10);
    try {
      const path = `videos/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("promo-videos").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (upErr) throw upErr;
      setProgress(75);

      // best-effort duration
      const durationSec = await new Promise<number>((resolve) => {
        try {
          const el = document.createElement("video");
          el.preload = "metadata";
          el.onloadedmetadata = () => resolve(Math.round(el.duration || 0));
          el.onerror = () => resolve(0);
          el.src = URL.createObjectURL(file);
        } catch { resolve(0); }
      });

      const { data: userData } = await supabase.auth.getUser();
      // disable other videos, insert new as enabled
      await supabase.from("promotional_videos").update({ enabled: false }).eq("enabled", true);
      const { error: insErr } = await supabase.from("promotional_videos").insert({
        video_url: path,
        duration_seconds: durationSec || null,
        file_size_bytes: file.size,
        format: file.type.split("/")[1] ?? null,
        enabled: true,
        uploaded_by: userData.user?.id ?? null,
      });
      if (insErr) throw insErr;

      setProgress(100);
      toast.success("Video uploaded");
      qc.invalidateQueries({ queryKey: ["promo-videos"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false); setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function toggleEnabled(v: PromoVideo) {
    if (!v.enabled) {
      await supabase.from("promotional_videos").update({ enabled: false }).eq("enabled", true);
    }
    await supabase.from("promotional_videos").update({ enabled: !v.enabled }).eq("id", v.id);
    qc.invalidateQueries({ queryKey: ["promo-videos"] });
  }

  async function remove(v: PromoVideo) {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    await supabase.storage.from("promo-videos").remove([v.video_url]).catch(() => {});
    const { error } = await supabase.from("promotional_videos").delete().eq("id", v.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["promo-videos"] });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Promotional Video</h1>
        <p className="text-sm text-muted-foreground">
          Plays full-screen the first time a visitor opens the app (skippable).
        </p>
      </header>

      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="card-luxe cursor-pointer border-2 border-dashed border-border/60 p-10 text-center transition hover:border-[oklch(0.82_0.13_88_/_0.5)]"
      >
        <input ref={fileRef} hidden type="file" accept="video/*" onChange={handleFile} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">
          {uploading ? `Uploading ${progress}%…` : "Click to upload a promo video"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">MP4, WebM, MOV — up to 500 MB</p>
        {uploading && (
          <div className="mx-auto mt-4 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[oklch(0.82_0.13_88)]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {active && previewUrl && (
        <div className="card-luxe overflow-hidden">
          <video src={previewUrl} controls className="w-full bg-black" />
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground">All videos</h2>
        {(videos ?? []).length === 0 && (
          <div className="card-luxe p-6 text-center text-sm text-muted-foreground">No videos yet.</div>
        )}
        <ul className="space-y-2">
          {(videos ?? []).map((v) => (
            <li key={v.id} className="card-luxe flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.video_url.split("/").pop()}</p>
                <p className="text-xs text-muted-foreground">
                  {v.format ?? "—"} · {v.duration_seconds ?? 0}s · {((v.file_size_bytes ?? 0) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => toggleEnabled(v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                  v.enabled ? "border-green-500/40 text-green-400" : "border-border text-muted-foreground"
                }`}
              >
                {v.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {v.enabled ? "Enabled" : "Disabled"}
              </button>
              <button
                onClick={() => remove(v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
