import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BatLogo } from "@/lib/brand";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [hasSuper, setHasSuper] = useState<boolean | null>(null);
  const [panel, setPanel] = useState<"owner" | "super">("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // Route already-signed-in users to their dashboard.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: sess }, { data: exists }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.rpc("super_admin_exists"),
      ]);
      if (cancelled) return;
      setHasSuper(Boolean(exists));
      const user = sess.session?.user;
      if (user) {
        const { data: role } = await supabase
          .from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
        if (cancelled) return;
        if (role?.role === "super_admin") navigate({ to: "/admin" });
        else if (role?.role === "restaurant_admin") navigate({ to: "/my-menu" });
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const mode: "login" | "bootstrap" =
    panel === "super" && hasSuper === false ? "bootstrap" : "login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "bootstrap") {
        if (password !== confirm) throw new Error("Passwords do not match");
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr) throw signUpErr;
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        const { error: claimErr } = await supabase.rpc("claim_super_admin");
        if (claimErr) throw claimErr;
        toast.success("Super Admin created");
        navigate({ to: "/admin" });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", user!.id).maybeSingle();
      toast.success("Welcome back");
      if (role?.role === "super_admin") navigate({ to: "/admin" });
      else if (role?.role === "restaurant_admin") navigate({ to: "/my-menu" });
      else navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <CinematicBackdrop />
      <ArhxyWordmark />
      <Particles />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_80%_at_50%_10%,transparent_0%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.9)_100%)]" />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-10 pt-8 sm:px-8">
        {/* Top brand bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BatLogo className="h-7 w-7 text-white" />
            <span className="font-display text-lg tracking-tight">
              BAT <span className="opacity-60">MENU</span>
            </span>
          </div>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/50 sm:flex">
            <span className="h-1 w-1 rounded-full bg-white/60" />
            Luxury Digital Menus
          </div>
        </header>

        {/* Hero + login */}
        <div className="mt-8 grid flex-1 items-center gap-10 lg:mt-14 lg:grid-cols-[1.05fr_minmax(320px,420px)]">
          {/* Left: hero copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">
              Presented by ARHXY
            </p>
            <h1 className="mt-5 font-display text-[44px] leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              A menu, <br />
              <span className="italic text-white/90">reimagined.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              BAT MENU turns every restaurant into a premium digital experience —
              a single luxurious QR that opens a beautifully designed menu, updated in real time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
              <Badge>Fine Dining</Badge>
              <Badge>Cafés</Badge>
              <Badge>Cloud Kitchens</Badge>
              <Badge>Bakeries</Badge>
            </div>
          </motion.div>

          {/* Right: glass login */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-px rounded-[28px] bg-gradient-to-b from-white/25 via-white/10 to-white/5 opacity-70 blur-md" />
            <div
              className="relative rounded-[26px] border border-white/15 bg-white/[0.06] p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:p-8"
              style={{ backdropFilter: "blur(28px) saturate(160%)" }}
            >
              {/* Tabs */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">
                    {panel === "owner" ? "Restaurant Access" : "Super Admin"}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl leading-tight">
                    {mode === "bootstrap" ? "Create Super Admin" : "Sign in"}
                  </h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/5 p-1 text-[10px]">
                  <button
                    onClick={() => setPanel("owner")}
                    className={`rounded-full px-3 py-1.5 uppercase tracking-widest transition ${
                      panel === "owner" ? "bg-white text-black" : "text-white/60"
                    }`}
                  >Owner</button>
                  <button
                    onClick={() => setPanel("super")}
                    className={`rounded-full px-3 py-1.5 uppercase tracking-widest transition ${
                      panel === "super" ? "bg-white text-black" : "text-white/60"
                    }`}
                  >Super</button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={`${panel}-${mode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={onSubmit}
                  className="space-y-4"
                >
                  <GlassField
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                  />
                  <GlassField
                    icon={<Lock className="h-4 w-4" />}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
                    minLength={mode === "bootstrap" ? 8 : undefined}
                  />
                  {mode === "bootstrap" && (
                    <GlassField
                      icon={<Shield className="h-4 w-4" />}
                      label="Confirm password"
                      type="password"
                      value={confirm}
                      onChange={setConfirm}
                      autoComplete="new-password"
                      minLength={8}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
                  >
                    {busy ? "Please wait…" : mode === "bootstrap" ? "Create Super Admin" : "Enter"}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>

                  <p className="pt-1 text-center text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {panel === "owner"
                      ? "Restaurant owners — contact your Super Admin for access"
                      : mode === "bootstrap"
                      ? "First-time setup — one account only"
                      : "Reserved for the ARHXY administrator"}
                  </p>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <footer className="mt-10 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>© {new Date().getFullYear()} ARHXY</span>
          <span>Smart Digital Menus</span>
        </footer>
      </main>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
      {children}
    </span>
  );
}

function GlassField(props: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  autoComplete?: string; minLength?: number; icon?: React.ReactNode;
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
        minLength={props.minLength}
        required
        className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-white/40 focus:ring-2 focus:ring-white/10"
      />
    </label>
  );
}

/* ----------------- Cinematic backdrop pieces ----------------- */

function CinematicBackdrop() {
  return (
    <>
      {/* Slow luminous gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
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
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      {/* Slow drifting sheen */}
      <motion.div
        className="pointer-events-none absolute -inset-x-40 top-1/3 z-[1] h-[40vh] opacity-[0.08] blur-3xl"
        style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }}
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />
    </>
  );
}

function ArhxyWordmark() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 0.06, scale: 1 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 select-none text-center"
    >
      <div
        className="font-display leading-none tracking-[0.02em]"
        style={{
          fontSize: "clamp(180px, 30vw, 520px)",
          background: "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.2) 100%)",
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

function Particles() {
  const seed = useRef(Math.random());
  const dots = useMemo(() => {
    const s = seed.current;
    return Array.from({ length: 26 }, (_, i) => {
      const x = ((i * 97 + s * 1000) % 100);
      const y = ((i * 53 + s * 700) % 100);
      const size = 1 + ((i * 13) % 3);
      const dur = 10 + ((i * 7) % 16);
      const delay = (i * 0.4) % 6;
      return { x, y, size, dur, delay };
    });
  }, []);
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
            opacity: 0.35,
            boxShadow: "0 0 8px rgba(255,255,255,0.6)",
          }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
    }
