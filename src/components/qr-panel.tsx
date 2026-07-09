import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";

export function menuUrl(slug: string): string {
  if (typeof window !== "undefined") return `${window.location.origin}/m/${slug}`;
  return `/m/${slug}`;
}

export function QrPanel({ slug, name }: { slug: string; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svg, setSvg] = useState<string>("");
  const url = menuUrl(slug);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, {
      width: 512, margin: 2,
      color: { dark: "#0B0B0F", light: "#F4E7BE" },
      errorCorrectionLevel: "H",
    });
    QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#0B0B0F", light: "#FFFFFF" }, errorCorrectionLevel: "H" })
      .then(setDataUrl);
    QRCode.toString(url, { type: "svg", margin: 2, color: { dark: "#0B0B0F", light: "#FFFFFF" }, errorCorrectionLevel: "H" })
      .then(setSvg);
  }, [url]);

  function download(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: name, text: `${name} — Menu`, url });
      else { await navigator.clipboard.writeText(url); }
    } catch { /* cancelled */ }
  }

  return (
    <div className="card-luxe p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-3">
          <canvas ref={canvasRef} className="block h-56 w-56" />
        </div>
        <p className="text-xs text-muted-foreground break-all text-center">{url}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => download(dataUrl, `${slug}-qr.png`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button onClick={() => {
              const blob = new Blob([svg], { type: "image/svg+xml" });
              download(URL.createObjectURL(blob), `${slug}-qr.svg`);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Download className="h-3.5 w-3.5" /> SVG
          </button>
          <button onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
