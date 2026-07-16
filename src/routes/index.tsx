import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  loader: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role, restaurant_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (role?.role === "super_admin") throw redirect({ to: "/admin" });
    if (role?.role === "restaurant_admin") throw redirect({ to: "/my-menu" });
    // No role yet — send to auth for bootstrap or re-login
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});
