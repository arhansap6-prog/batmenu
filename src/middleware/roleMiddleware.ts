import { redirect } from "@tanstack/react-router";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: "super_admin" | "restaurant_admin" | "customer";
  } | null;
}

export const requireSuperAdmin = (context: AuthContext) => {
  if (!context.user || context.user.role !== "super_admin") {
    throw redirect({ to: "/unauthorized" });
  }
};

export const requireRestaurantAdmin = (context: AuthContext) => {
  if (!context.user || !["restaurant_admin", "super_admin"].includes(context.user.role)) {
    throw redirect({ to: "/unauthorized" });
  }
};

export const requireAuth = (context: AuthContext) => {
  if (!context.user) {
    throw redirect({ to: "/" });
  }
};
