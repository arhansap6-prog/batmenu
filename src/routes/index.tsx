import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [splash, setSplash] = useState(true);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  // Splash timer — 3.5 seconds
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <CinematicBackdrop />
      <ArhxyWordmark />
      <Particles />

      <AnimatePresence mode="wait">
        {splash ? (
          <SplashScreen key="splash" />
        ) : (
          <MainScreen key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo reveal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/8 backdrop-blur-xl"
          style={{ boxShadow: "0 0 60px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)" }}
        >
          <span className="font-display text-3xl font-bold text-white">B</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="text-2xl font-light uppercase text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          BAT MENU
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-2 text-[11px] uppercase tracking-[0.4em] text-white"
        >
          Smart Digital Menus
        </motion.p>
      </motion.div>

      {/* Bottom loading line */}
      <motion.div
        className="absolute bottom-16 left-1/2 h-px w-24 -translate-x-1/2 overflow-hidden rounded-full bg-white/10"
      >
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Screen (Landing + Login) ───────────────────────────────────────────

function MainScreen() {
  const [mode, setMode] = useState<"owner" | "admin">("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-12"
    >
      {/* Top branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mb-10 text-center"
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/8 backdrop-blur"
          style={{ boxShadow: "0 0 40px rgba(255,255,255,0.06)" }}
        >
          <span className="font-display text-xl font-bold text-white">B</span>
        </div>
        <h1 className="text-[13px] uppercase tracking-[0.35em] text-white/60">BAT MENU</h1>
      </motion.div>

      {/* Glass login card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/12 backdrop-blur-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Mode tabs */}
        <div className="flex border-b border-white/8">
          <button
            onClick={() => setMode("owner")}
            className={`flex-1 py-4 text-[11px] uppercase tracking-[0.25em] transition ${mode === "owner" ? "text-white border-b-2 border-white" : "text-white/35 hover:text-white/60"}`}
          >
            Restaurant Login
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`flex-1 py-4 text-[11px] uppercase tracking-[0.25em] transition ${mode === "admin" ? "text-white border-b-2 border-white" : "text-white/35 hover:text-white/60"}`}
          >
            Super Admin
          </button>
        </div>

        {/* Form */}
        <div className="p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "owner" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "owner" ? 16 : -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-1 font-display text-xl text-white">
                {mode === "owner" ? "Welcome back" : "Admin access"}
              </h2>
              <p className="mb-6 text-[12px] text-white/40">
                {mode === "owner"
                  ? "Sign in to manage your restaurant menu"
                  : "Restricted to authorized personnel only"}
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <GlassField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  icon={<Mail size={11} />}
                />

                {/* Password */}
                <div className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-white/50">
                    <Lock size={11} /> Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 pr-11 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/40 focus:ring-2 focus:ring-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="relative mt-2 w-full overflow-hidden rounded-2xl py-3.5 text-[13px] font-medium tracking-wide transition disabled:opacity-60"
                  style={{
                    background: mode === "admin"
                      ? "linear-gradient(135deg, #1a1a1a, #333)"
                      : "linear-gradient(135deg, #fff, #e8e8e8)",
                    color: mode === "admin" ? "#fff" : "#000",
                    boxShadow: mode === "admin"
                      ? "0 8px 32px rgba(0,0,0,0.4)"
                      : "0 8px 32px rgba(255,255,255,0.15)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in…
                    </span>
                  ) : (
                    mode === "owner" ? "Sign In" : "Admin Sign In"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-3 border-t border-white/6 px-7 py-4">
          <Badge>Secure</Badge>
          <Badge>Encrypted</Badge>
          <Badge>Premium</Badge>
        </div>
      </motion.div>

      {/* Bottom copyright */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center justify-between w-full max-w-sm text-[10px] uppercase tracking-[0.3em] text-white/25"
      >
        <span>© {new Date().getFullYear()} ARHXY</span>
        <span>Smart Digital Menus</span>
      </motion.footer>
    </motion.div>
  );
}

// ─── Cinematic Backdrop ───────────────────────────────────────────────────────

function CinematicBackdrop() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(255,255,255,0.10), transparent 60%)," +
            "radial-gradient(50% 50% at 85% 15%, rgba(255,255,255,0.06), transparent 60%)," +
            "radial-gradient(70% 60% at 50% 100%, rgba(255,255,255,0.05), transparent 60%)," +
            "linear-gradient(180deg, #050505 0%, #0a0a0a 60%, #000 100%)",
        }}
      />
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      {/* Drifting sheen */}
      <motion.div
        className="pointer-events-none absolute -inset-x-40 top-1/3 z-[1] h-[40vh] opacity-[0.06] blur-3xl"
        style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }}
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
    </>
  );
}

// ─── ARHXY Wordmark ───────────────────────────────────────────────────────────

function ArhxyWordmark() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 0.055, scale: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 select-none text-center"
    >
      <div
        style={{
          fontSize: "clamp(100px, 28vw, 480px)",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.15) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "blur(0.5px)",
        }}
      >
        ARHXY
      </div>
    </motion.div>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────

function Particles() {
  const dots = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      x: (i * 97 + 42) % 100,
      y: (i * 53 + 17) % 100,
      size: 1 + (i % 3),
      dur: 10 + (i * 7) % 16,
      delay: (i * 0.4) % 6,
    })), []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[2]">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            opacity: 0.3,
            boxShadow: "0 0 6px rgba(255,255,255,0.5)",
          }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white/35">
      {children}
    </span>
  );
}

function GlassField(props: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-white/50">
        {props.icon}{props.label}
      </span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        required
        className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/40 focus:ring-2 focus:ring-white/10"
      />
    </label>
  );
}

