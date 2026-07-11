import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const emailSchema = z.string().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(120);
const slugSchema = z.string().regex(/^[a-z0-9-]{2,48}$/);

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: Super Admin only");
}

export const createRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      name: nameSchema,
      slug: slugSchema,
      owner_name: nameSchema,
      owner_email: emailSchema,
      owner_password: passwordSchema,
      phone: z.string().max(40).optional().nullable(),
      address: z.string().max(500).optional().nullable(),
      business_type: z.string().max(80).optional().nullable(),
      opening_hours: z.string().max(120).optional().nullable(),
      description: z.string().max(1000).optional().nullable(),
      welcome_message: z.string().max(200).optional().nullable(),
      logo_url: z.string().max(500).optional().nullable(),
      banner_url: z.string().max(500).optional().nullable(),
      theme: z.string().max(40).optional(),
      primary_color: z.string().max(40).optional(),
      secondary_color: z.string().max(40).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure slug unique
    const { data: existing } = await supabaseAdmin
      .from("restaurants").select("id").eq("slug", data.slug).maybeSingle();
    if (existing) throw new Error("Slug already in use");

    // Create the auth user (restaurant admin)
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.owner_email,
      password: data.owner_password,
      email_confirm: true,
      user_metadata: { name: data.owner_name, role: "restaurant_admin" },
    });
    if (userErr || !userRes.user) throw new Error(userErr?.message ?? "Could not create owner account");
    const ownerId = userRes.user.id;

    // Insert restaurant row
    const { data: restaurant, error: restErr } = await supabaseAdmin
      .from("restaurants")
      .insert({
        name: data.name, slug: data.slug, owner_id: ownerId,
        owner_name: data.owner_name, owner_email: data.owner_email,
        phone: data.phone ?? null, address: data.address ?? null,
        business_type: data.business_type ?? null, opening_hours: data.opening_hours ?? null,
        description: data.description ?? null, welcome_message: data.welcome_message ?? null,
        logo_url: data.logo_url ?? null, banner_url: data.banner_url ?? null,
        theme: data.theme ?? "luxury-dark",
        primary_color: data.primary_color ?? "#D4AF37",
        secondary_color: data.secondary_color ?? "#0B0B0F",
      })
      .select("*").single();
    if (restErr || !restaurant) {
      await supabaseAdmin.auth.admin.deleteUser(ownerId).catch(() => {});
      throw new Error(restErr?.message ?? "Could not create restaurant");
    }

    // Assign role, link to restaurant
    const { error: roleErr } = await supabaseAdmin.from("user_roles")
      .insert({ user_id: ownerId, role: "restaurant_admin", restaurant_id: restaurant.id });
    if (roleErr) throw new Error(roleErr.message);

    return { restaurant };
  });

export const deleteRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r } = await supabaseAdmin.from("restaurants").select("owner_id").eq("id", data.id).maybeSingle();
    const ownerId = r?.owner_id;
    const { error } = await supabaseAdmin.from("restaurants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (ownerId) await supabaseAdmin.auth.admin.deleteUser(ownerId).catch(() => {});
    return { ok: true };
  });

export const setRestaurantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "suspended"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("restaurants").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetOwnerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), new_password: passwordSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r } = await supabaseAdmin.from("restaurants").select("owner_id").eq("id", data.id).maybeSingle();
    if (!r?.owner_id) throw new Error("Restaurant owner not found");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(r.owner_id, { password: data.new_password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateRestaurantMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      name: nameSchema.optional(),
      slug: slugSchema.optional(),
      phone: z.string().max(40).optional().nullable(),
      address: z.string().max(500).optional().nullable(),
      business_type: z.string().max(80).optional().nullable(),
      opening_hours: z.string().max(120).optional().nullable(),
      description: z.string().max(1000).optional().nullable(),
      welcome_message: z.string().max(200).optional().nullable(),
      logo_url: z.string().max(500).optional().nullable(),
      banner_url: z.string().max(500).optional().nullable(),
      theme: z.string().max(40).optional(),
      primary_color: z.string().max(40).optional(),
      secondary_color: z.string().max(40).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...update } = data;
    const { error } = await supabaseAdmin.from("restaurants").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
