import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandWordmark, APP_TAGLINE } from "@/lib/brand";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [hasSuper, setHasSuper] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("super_admin_exists");
      const exists = Boolean(data);
      setHasSuper(exists);
      setMode(exists ? "login" : "bootstrap");
      const session = await supabase.auth.getSession();
      if (session.data.session) navigate({ to: next ?? "/" });
    })();
  }, [navigate, next]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: next ?? "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally { setBusy(false); }
  }

  async function onBootstrap(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    try {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) throw signUpErr;
      // Ensure signed in (auto-confirm is on)
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      const { error: claimErr } = await supabase.rpc("claim_super_admin");
      if (claimErr) throw claimErr;
      toast.success("Super Admin created");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{ background: "radial-gradient(60% 40% at 50% -10%, oklch(0.82 0.13 88 / 0.18), transparent 60%)" }} />
      <div className="glass w-full max-w-md rounded-3xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <BrandWordmark />
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        {hasSuper === null ? (
          <div className="mt-10 h-40 rounded-2xl shimmer" />
        ) : mode === "bootstrap" ? (
          <form onSubmit={onBootstrap} className="mt-8 space-y-4">
            <div>
              <h1 className="font-display text-2xl">Create Super Admin</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                First-time setup. Only one Super Admin account can ever exist.
              </p>
            </div>
            <Field label="Email" type="email" value={email} onChange={setEmail} autoFocus autoComplete="email" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required minLength={8} />
            <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" required minLength={8} />
            <button disabled={busy} className="btn-gold w-full rounded-2xl py-3 text-sm">
              {busy ? "Creating…" : "Create Super Admin"}
            </button>
          </form>
        ) : (
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <div>
              <h1 className="font-display text-2xl">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Access your BAT MENU workspace.
              </p>
            </div>
            <Field label="Email" type="email" value={email} onChange={setEmail} autoFocus autoComplete="email" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-transparent accent-[oklch(0.82_0.13_88)]" />
              Remember me on this device
            </label>
            <button disabled={busy} className="btn-gold w-full rounded-2xl py-3 text-sm">
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Trouble signing in? Ask your Super Admin to reset your password.
            </p>
          </form>
        )}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  autoFocus?: boolean; autoComplete?: string; required?: boolean; minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoFocus={props.autoFocus}
        autoComplete={props.autoComplete}
        required={props.required}
        minLength={props.minLength}
        className="w-full rounded-2xl border border-border bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-[oklch(0.82_0.13_88_/_0.6)] focus:ring-2 focus:ring-[oklch(0.82_0.13_88_/_0.25)]"
      />
    </label>
  );
}
