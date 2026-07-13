import { createFileRoute } from "@tanstack/react-router";import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

export default function LandingPage() {
  const [splash, setSplash] = useState(true);
  const [mode, setMode] = useState<"owner" | "admin">("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    navigate({ to: "/_authenticated/admin" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Cinematic Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(255,255,255,0.10), transparent 60%)," +
            "radial-gradient(50% 50% at 85% 15%, rgba(255,255,255,0.06), transparent 60%)," +
            "linear-gradient(180deg, #050505 0%, #0a0a0a 60%, #000 100%)",
        }}
      />

      {/* ARHXY Watermark */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 0.04, scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-x-0 top-1/3 text-center select-none"
          style={{
            fontSize: "clamp(100px, 28vw, 480px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.15) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ARHXY
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {[...Array(28)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 97 + 42) % 100}%`,
              top: `${(i * 53 + 17) % 100}%`,
              width: 1 + (i % 3),
              height: 1 + (i % 3),
              opacity: 0.3,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 10 + (i * 7) % 16,
              delay: (i * 0.4) % 6,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {splash ? (
          <SplashScreen key="splash" />
        ) : (
          <MainScreen
            key="main"
            mode={mode}
            setMode={setMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPass={showPass}
            setShowPass={setShowPass}
            loading={loading}
            handleLogin={handleLogin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/8 backdrop-blur-xl"
          style={{ boxShadow: "0 0 60px rgba(255,255,255,0.08)" }}
        >
          <span className="font-display text-3xl font-bold text-white">B</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="text-2xl font-light uppercase text-white"
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

      <motion.div
        className="absolute bottom-16 left-1/2 h-px w-24 -translate-x-1/2 overflow-hidden rounded-full bg-white/10"
      >
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, delay: 0.8 }}
        />
      </motion.div>
    </motion.div>
  );
}

function MainScreen({ mode, setMode, email, setEmail, password, setPassword, showPass, setShowPass, loading, handleLogin }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/8 backdrop-blur">
          <span className="font-display text-xl font-bold text-white">B</span>
        </div>
        <h1 className="text-[13px] uppercase tracking-[0.35em] text-white/60">BAT MENU</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/12 backdrop-blur-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Mode Tabs */}
        <div className="flex border-b border-white/8">
          <button
            onClick={() => setMode("owner")}
            className={`flex-1 py-4 text-[11px] uppercase tracking-[0.25em] transition ${
              mode === "owner" ? "text-white border-b-2 border-white" : "text-white/35 hover:text-white/60"
            }`}
          >
            Restaurant Login
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`flex-1 py-4 text-[11px] uppercase tracking-[0.25em] transition ${
              mode === "admin" ? "text-white border-b-2 border-white" : "text-white/35 hover:text-white/60"
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Form */}
        <div className="p-7">
          <h2 className="mb-1 font-display text-xl text-white">
            {mode === "owner" ? "Welcome back" : "Admin access"}
          </h2>
          <p className="mb-6 text-[12px] text-white/40">
            {mode === "owner"
              ? "Sign in to manage your restaurant menu"
              : "Restricted to authorized personnel only"}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-white/50">
                <Mail size={11} /> Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/40 focus:ring-2 focus:ring-white/10"
              />
            </div>

            <div>
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] text-white/50">
                <Lock size={11} /> Password
              </span>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="relative mt-2 w-full overflow-hidden rounded-2xl py-3.5 text-[13px] font-medium tracking-wide transition disabled:opacity-60"
              style={{
                background:
                  mode === "admin"
                    ? "linear-gradient(135deg, #1a1a1a, #333)"
                    : "linear-gradient(135deg, #fff, #e8e8e8)",
                color: mode === "admin" ? "#fff" : "#000",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="block h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center justify-between w-full max-w-sm text-[10px] uppercase tracking-[0.3em] text-white/25"
      >
        <span>© 2026 ARHXY</span>
        <span>Smart Digital Menus</span>
      </motion.footer>
    </motion.div>
  );
}

