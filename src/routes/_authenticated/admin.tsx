import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandWordmark } from "@/lib/brand";
import { toast } from "sonner";
import {
  LayoutDashboard, Store, PlusCircle, QrCode, LogOut, Menu as MenuIcon, X, Palette,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  loader: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { role: null };
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    return { role: role?.role ?? null };
  },
  component: AdminShell,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/restaurants", label: "Restaurants", icon: Store },
  { to: "/admin/restaurants/new", label: "Create Restaurant", icon: PlusCircle },
  { to: "/admin/templates", label: "Templates", icon: Palette },
  { to: "/admin/qr", label: "QR Manager", icon: QrCode },
];

function AdminShell() {
  const navigate = useNavigate();
  const { role } = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (role === "restaurant_admin") navigate({ to: "/my-menu" });
    if (role === null) navigate({ to: "/auth" });
  }, [role, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  const emailQ = useQuery({
    queryKey: ["me-email"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.email ?? "",
  });

  return (
    <div className="min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button className="rounded-xl border border-border p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
          <BrandWordmark />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{emailQ.data}</span>
            <button onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs hover:border-[oklch(0.82_0.13_88_/_0.4)]">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className={`${open ? "block" : "hidden"} fixed inset-x-4 top-16 z-20 md:static md:block md:w-60 md:flex-none`}>
          <nav className="glass rounded-2xl p-2">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link to={item.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-[oklch(0.82_0.13_88_/_0.12)] text-foreground ring-gold"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
