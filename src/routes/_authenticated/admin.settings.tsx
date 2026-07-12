import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Save, Upload, X, Check, AlertCircle, Palette, Play,
  Type, Image as ImageIcon, Settings, Eye, Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type AppConfig = {
  appName: string;
  appLogo: string;
  primaryColor: string;
  secondaryColor: string;
  splashVideo: string;
  splashDuration: number;
  splashAutoHide: boolean;
  landingBackground: string;
  landingAnimation: "particles" | "gradient" | "video";
  brandingText: string;
  brandingColor: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [tab, setTab] = useState<"branding" | "splash" | "landing" | "colors">(
    "branding"
  );
  const [config, setConfig] = useState<AppConfig>({
    appName: "BAT MENU",
    appLogo: "https://via.placeholder.com/100",
    primaryColor: "#FFD700",
    secondaryColor: "#000000",
    splashVideo: "",
    splashDuration: 3500,
    splashAutoHide: true,
    landingBackground: "gradient",
    landingAnimation: "particles",
    brandingText: "ARHXY",
    brandingColor: "#ffffff",
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  async function saveConfig() {
    setSaving(true);
    // Simulate API call to Supabase
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Settings saved successfully!");
    setSaving(false);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({
          ...prev,
          appLogo: event.target?.result as string,
        }));
        toast.success("Logo uploaded");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({
          ...prev,
          splashVideo: event.target?.result as string,
        }));
        toast.success("Splash video uploaded");
      };
      reader.readAsDataURL(file);
    }
  }

  const updateConfig = (patch: Partial<AppConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#080808]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl tracking-tight">App Settings</h1>
              <p className="text-[11px] text-white/35 mt-0.5 uppercase tracking-widest">
                Branding, Splash, Landing Configuration
              </p>
            </div>
            <motion.button
              onClick={saveConfig}
              disabled={saving}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-2.5 text-[13px] font-medium text-black transition disabled:opacity-50 hover:bg-white/90"
            >
              {saving ? (
                <>
                  <motion.span
                    className="block h-4 w-4 rounded-full border-2 border-black border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save
                </>
              )}
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {(["branding", "splash", "landing", "colors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] uppercase tracking-wider transition ${
                  tab === t
                    ? "border border-white bg-white/10"
                    : "border border-white/10 text-white/40 hover:border-white/25"
                }`}
              >
                {t === "branding" && <ImageIcon size={13} />}
                {t === "splash" && <Play size={13} />}
                {t === "landing" && <Eye size={13} />}
                {t === "colors" && <Palette size={13} />}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {tab === "branding" && (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* App Name */}
              <Card>
                <Label>App Name</Label>
                <input
                  value={config.appName}
                  onChange={(e) => updateConfig({ appName: e.target.value })}
                  className="input-field mt-2"
                />
              </Card>

              {/* App Logo */}
              <Card>
                <Label>App Logo</Label>
                <div className="mt-4 flex gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/12 bg-white/3">
                    {config.appLogo ? (
                      <img
                        src={config.appLogo}
                        alt="logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImageIcon size={32} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <button
                      onClick={() => logoRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 text-[12px] uppercase tracking-wider transition hover:border-white/40"
                    >
                      <Upload size={13} /> Choose File
                    </button>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      hidden
                    />
                    <p className="text-[11px] text-white/35">
                      PNG, JPG up to 2MB. Recommended: 200x200px square.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Branding Text */}
              <Card>
                <Label>Branding Text (appears as watermark)</Label>
                <input
                  value={config.brandingText}
                  onChange={(e) => updateConfig({ brandingText: e.target.value })}
                  placeholder="e.g. ARHXY"
                  className="input-field mt-2"
                />
              </Card>
            </motion.div>
          )}

          {tab === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Splash Video */}
              <Card>
                <Label>Splash Video (3-5 seconds)</Label>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => videoRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/3 py-8 text-[12px] uppercase tracking-wider transition hover:border-white/30"
                  >
                    <Upload size={18} /> Upload Video
                  </button>
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    hidden
                  />
                  {config.splashVideo && (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <video
                        src={config.splashVideo}
                        className="w-full h-40 object-cover"
                        controls
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-white/35">
                    MP4, WebM. Max 10MB. Recommended: 1080x1920 or 9:16 aspect ratio.
                  </p>
                </div>
              </Card>

              {/* Splash Duration */}
              <Card>
                <Label>Splash Duration (milliseconds)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    value={config.splashDuration}
                    onChange={(e) =>
                      updateConfig({ splashDuration: Number(e.target.value) })
                    }
                    className="input-field flex-1"
                  />
                  <span className="text-[11px] text-white/35">
                    {(config.splashDuration / 1000).toFixed(1)}s
                  </span>
                </div>
              </Card>

              {/* Auto Hide */}
              <Card>
                <Toggle
                  label="Auto Hide Splash"
                  value={config.splashAutoHide}
                  onChange={(v) => updateConfig({ splashAutoHide: v })}
                />
              </Card>
            </motion.div>
          )}

          {tab === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Landing Animation */}
              <Card>
                <Label>Landing Animation Style</Label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {["particles", "gradient", "video"].map((anim) => (
                    <button
                      key={anim}
                      onClick={() =>
                        updateConfig({
                          landingAnimation: anim as AppConfig["landingAnimation"],
                        })
                      }
                      className={`rounded-xl border-2 px-4 py-3 text-[12px] uppercase tracking-wider transition ${
                        config.landingAnimation === anim
                          ? "border-white bg-white/10"
                          : "border-white/12 text-white/50 hover:border-white/25"
                      }`}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Background */}
              <Card>
                <Label>Landing Background</Label>
                <textarea
                  value={config.landingBackground}
                  onChange={(e) =>
                    updateConfig({ landingBackground: e.target.value })
                  }
                  placeholder="Describe background (gradient, image URL, etc)"
                  rows={3}
                  className="input-field mt-2 resize-none"
                />
              </Card>
            </motion.div>
          )}

          {tab === "colors" && (
            <motion.div
              key="colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Primary Color */}
              <Card>
                <Label>Primary Color (Accent)</Label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) =>
                      updateConfig({ primaryColor: e.target.value })
                    }
                    className="h-12 w-12 cursor-pointer rounded-lg border border-white/20"
                  />
                  <input
                    value={config.primaryColor}
                    onChange={(e) =>
                      updateConfig({ primaryColor: e.target.value })
                    }
                    className="input-field flex-1 font-mono"
                  />
                </div>
              </Card>

              {/* Secondary Color */}
              <Card>
                <Label>Secondary Color</Label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) =>
                      updateConfig({ secondaryColor: e.target.value })
                    }
                    className="h-12 w-12 cursor-pointer rounded-lg border border-white/20"
                  />
                  <input
                    value={config.secondaryColor}
                    onChange={(e) =>
                      updateConfig({ secondaryColor: e.target.value })
                    }
                    className="input-field flex-1 font-mono"
                  />
                </div>
              </Card>

              {/* Branding Color */}
              <Card>
                <Label>Branding Text Color</Label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={config.brandingColor}
                    onChange={(e) =>
                      updateConfig({ brandingColor: e.target.value })
                    }
                    className="h-12 w-12 cursor-pointer rounded-lg border border-white/20"
                  />
                  <input
                    value={config.brandingColor}
                    onChange={(e) =>
                      updateConfig({ brandingColor: e.target.value })
                    }
                    className="input-field flex-1 font-mono"
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Button */}
      <motion.button
        onClick={() => setPreview(!preview)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-5 py-3 text-[12px] uppercase tracking-wider text-white transition hover:bg-white/15"
        whileTap={{ scale: 0.95 }}
      >
        <Eye size={14} /> Preview
      </motion.button>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4"
            onClick={() => setPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/20"
            >
              <button
                onClick={() => setPreview(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
              >
                <X size={14} />
              </button>
              <div
                className="relative h-96 flex flex-col items-center justify-center text-center"
                style={{
                  background: `linear-gradient(135deg, ${config.secondaryColor} 0%, ${config.primaryColor} 100%)`,
                }}
              >
                {config.appLogo && (
                  <img
                    src={config.appLogo}
                    alt="preview"
                    className="h-20 w-20 rounded-xl mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-white">
                  {config.appName}
                </h2>
                <p
                  className="mt-4 text-[24px] font-light opacity-50"
                  style={{ color: config.brandingColor }}
                >
                  {config.brandingText}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-[13px]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-white" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const styles = `
  .input-field {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
    color: white;
    outline: none;
    transition: border-color 0.2s;
  }
  .input-field:focus {
    border-color: rgba(255, 255, 255, 0.25);
  }
  .input-field::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export function SettingsStyles() {
  return <style>{styles}</style>;
}

