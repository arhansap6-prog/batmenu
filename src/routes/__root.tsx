import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthContext } from "@/middleware/roleMiddleware";

declare global {
  interface LayoutGenerics {
    context: AuthContext;
  }
}

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ context }) => {
    // Verify role on every route change
    if (context.user && !["super_admin", "restaurant_admin", "customer"].includes(context.user.role)) {
      throw new Error("Invalid role");
    }
    return context;
  },
});

export function RootLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Outlet />
    </div>
  );
}
