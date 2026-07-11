import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createRestaurant } from "@/lib/admin.functions";
import { slugify } from "@/lib/slug";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/restaurants/new")({
  component: NewRestaurant,
});

type FormState = {
  name: string; slug: string; owner_name: string; owner_email: string; owner_password: string;
  phone: string; address: string; business_type: string; opening_hours: string;
  description: string; welcome_message: string;
  theme: string; primary_color: string; secondary_color: string;
};

const THEMES = [
  { id: "luxury-dark", name: "Luxury Dark", primary: "#D4AF37", secondary: "#0B0B0F" },
  { id: "luxury-white", name: "Luxury White", primary: "#111111", secondary: "#F7F5EE" },
  { id: "pizza", name: "Pizza", primary: "#E53935", secondary: "#1B1B1B" },
  { id: "cafe", name: "Café", primary: "#8B5E34", secondary: "#F1E9DC" },
  { id: "modern", name: "Modern", primary: "#7C5CFF", secondary: "#0B0B12" },
  { id: "minimal", name: "Minimal", primary: "#111111", secondary: "#FFFFFF" },
];

function NewRestaurant() {
  const navigate = useNavigate();
  const fn = useServerFn(createRestaurant);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<FormState>({
    name: "", slug: "", owner_name: "", owner_email: "", owner_password: "",
    phone: "", address: "", business_type: "", opening_hours: "",
    description: "", welcome_message: "Welcome — we're delighted to have you.",
    theme: "luxury-dark", primary_color: "#D4AF37", secondary_color: "#0B0B0F",
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const derivedSlug = useMemo(() => slugify(state.name), [state.name]);
  const effectiveSlug = state.slug || derivedSlug;

  const steps = ["Information", "Branding", "Review"];

  async function submit() {
    setBusy(true);
    try {
      const res = await fn({
        data: {
          name: state.name.trim(),
          slug: effectiveSlug,
          owner_name: state.owner_name.trim(),
          owner_email: state.owner_email.trim(),
          owner_password: state.owner_password,
          phone: state.phone || null,
          address: state.address || null,
          business_type: state.business_type || null,
          opening_hours: state.opening_hours || null,
          description: state.description || null,
          welcome_message: state.welcome_message || null,
          theme: state.theme,
          primary_color: state.primary_color,
          secondary_color: state.secondary_color,
        },
      });
      toast.success("Restaurant created");
      navigate({ to: "/admin/restaurants/$id", params: { id: res.restaurant.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create restaurant");
    } finally { setBusy(false); }
  }

  function next() {
    if (step === 0) {
      if (!state.name.trim() || !state.owner_name.trim() || !state.owner_email.trim() || state.owner_password.length < 8) {
        toast.error("Fill required fields (password ≥ 8 chars)"); return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl">Create restaurant</h1>
        <p className="text-sm text-muted-foreground">Set up a restaurant, branding, and its owner login.</p>
      </header>

      {/* Stepper */}
      <ol className="flex items-center gap-3">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              i < step ? "bg-[oklch(0.82_0.13_88)] text-black"
              : i === step ? "ring-gold text-foreground" : "border border-border text-muted-foreground"
            }`}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</div>
            <span className={`text-xs ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < steps.length - 1 && <div className="ml-1 h-px flex-1 bg-border/60" />}
          </li>
        ))}
      </ol>

      <div className="card-luxe p-5 sm:p-7">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Restaurant name*" value={state.name} onChange={(v) => update("name", v)} />
            <Field label="URL slug" value={state.slug} onChange={(v) => update("slug", slugify(v))} placeholder={derivedSlug} help={`Public URL: /m/${effectiveSlug || "your-restaurant"}`} />
            <Field label="Owner name*" value={state.owner_name} onChange={(v) => update("owner_name", v)} />
            <Field label="Owner email (login)*" type="email" value={state.owner_email} onChange={(v) => update("owner_email", v)} />
            <Field label="Owner password*" type="password" value={state.owner_password} onChange={(v) => update("owner_password", v)} help="Minimum 8 characters" />
            <Field label="Phone" value={state.phone} onChange={(v) => update("phone", v)} />
            <Field label="Address" value={state.address} onChange={(v) => update("address", v)} className="sm:col-span-2" />
            <Field label="Business type" value={state.business_type} onChange={(v) => update("business_type", v)} placeholder="Cafe, Fine Dining, QSR…" />
            <Field label="Opening hours" value={state.opening_hours} onChange={(v) => update("opening_hours", v)} placeholder="Mon–Sun · 9:00–23:00" />
            <TextArea label="Description" value={state.description} onChange={(v) => update("description", v)} className="sm:col-span-2" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Theme</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {THEMES.map((t) => {
                  const active = state.theme === t.id;
                  return (
                    <button key={t.id} type="button"
                      onClick={() => setState((s) => ({ ...s, theme: t.id, primary_color: t.primary, secondary_color: t.secondary }))}
                      className={`rounded-2xl border p-4 text-left transition ${active ? "ring-gold border-transparent" : "border-border hover:border-white/20"}`}>
                      <div className="flex h-16 w-full items-center justify-center rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                      <p className="mt-3 text-sm">{t.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Primary color" value={state.primary_color} onChange={(v) => update("primary_color", v)} />
              <ColorField label="Secondary color" value={state.secondary_color} onChange={(v) => update("secondary_color", v)} />
              <TextArea label="Welcome message (customer sees this on the cover page)"
                value={state.welcome_message} onChange={(v) => update("welcome_message", v)} className="sm:col-span-2" />
            </div>
            <p className="text-xs text-muted-foreground">Logos and banners can be uploaded on the restaurant page after creation.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Review before you create.</p>
            <dl className="grid gap-x-6 gap-y-2 rounded-2xl bg-black/20 p-4 text-sm sm:grid-cols-2">
              <Row label="Name" value={state.name} />
              <Row label="Slug" value={`/m/${effectiveSlug}`} />
              <Row label="Owner" value={`${state.owner_name} · ${state.owner_email}`} />
              <Row label="Theme" value={state.theme} />
              <Row label="Phone" value={state.phone || "—"} />
              <Row label="Type" value={state.business_type || "—"} />
            </dl>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-40"
            disabled={step === 0 || busy}>
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-gold inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={busy} className="btn-gold rounded-full px-6 py-2 text-sm">
              {busy ? "Creating…" : "Create restaurant"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; help?: string; className?: string;
}) {
  return (
    <label className={`block ${props.className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <input type={props.type ?? "text"} value={props.value} onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.13_88_/_0.5)]" />
      {props.help && <span className="mt-1 block text-[11px] text-muted-foreground">{props.help}</span>}
    </label>
  );
}
function TextArea(props: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${props.className ?? ""}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <textarea rows={3} value={props.value} onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-black/20 px-3.5 py-2.5 text-sm outline-none focus:border-[oklch(0.82_0.13_88_/_0.5)]" />
    </label>
  );
}
function ColorField(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-black/20 px-2 py-1.5">
        <input type="color" value={props.value} onChange={(e) => props.onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
        <input type="text" value={props.value} onChange={(e) => props.onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none" />
      </div>
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate">{value}</dd>
    </>
  );
}
