import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}

export type RoleInfo = { role: "super_admin" | "restaurant_admin" | null; hasSuperAdmin: boolean };

export function useRoleInfo(userId: string | undefined) {
  return useQuery<RoleInfo>({
    queryKey: ["role", userId ?? "anon"],
    queryFn: async () => {
      const [{ data: existsData }, roleRes] = await Promise.all([
        supabase.rpc("super_admin_exists"),
        userId
          ? supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
      ]);
      return {
        role: (roleRes.data?.role as RoleInfo["role"]) ?? null,
        hasSuperAdmin: Boolean(existsData),
      };
    },
    staleTime: 30_000,
  });
}
