import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2, Copy, Printer, Check } from "lucide-react";
import { toast } from "sonner";

export function menuUrl(slug: string): string {
  if (typeof window !== "undefined") return `${window.location.origin}/m/${slug}`;
  return `/m/${slug}`;
}

export function QrPanel({ slug, name }: { slug: string; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svg, setSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);
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
    toast.success("Downloaded");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: name, text: `${name} — Menu`, url });
      else await copyLink();
    } catch { /* cancelled */ }
  }

  function print() {
    if (!dataUrl) return;
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) { toast.error("Popup blocked"); return; }
    w.document.write(`<!doctype html><html><head><title>${name} — QR</title>
      <style>
        @page { margin: 24mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
               display:flex; flex-direction:column; align-items:center; justify-content:center;
               min-height:100vh; text-align:center; color:#000; margin:0; padding:24px; }
        h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: -0.01em; }
        p  { font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; color:#666; margin: 0 0 32px; }
        img { width: 420px; height: 420px; }
        .url { margin-top: 24px; font-size: 11px; color:#888; word-break: break-all; }
      </style></head><body>
      <h1>${name}</h1>
      <p>Scan to view menu</p>
      <img src="${dataUrl}" alt="QR" />
      <div class="url">${url}</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),120);}</script>
      </body></html>`);
    w.document.close();
  }

  return (
    <div className="card-luxe p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-white p-3">
          <canvas ref={canvasRef} className="block h-56 w-56" />
        </div>
        <p className="text-xs text-muted-foreground break-all text-center">{url}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => download(dataUrl, `batmenu-${slug}-qr.png`)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
          <button onClick={() => {
              const blob = new Blob([svg], { type: "image/svg+xml" });
              download(URL.createObjectURL(blob), `batmenu-${slug}-qr.svg`);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Download className="h-3.5 w-3.5" /> SVG
          </button>
          <button onClick={copyLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </button>
          <button onClick={print}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
            <Printer className="h-3.5 w-3.5" /> Print
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
