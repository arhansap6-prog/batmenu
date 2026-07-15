// src/middleware/roleMiddleware.ts
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

// src/routes/__root.tsx
import { createRootRoute, Outlet, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

// src/routes/_authenticated.admin.super-dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { requireSuperAdmin } from "@/middleware/roleMiddleware";
import { motion } from "motion/react";
import { Settings, Users, BarChart3, Video, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/super-dashboard")({
  beforeLoad: ({ context }) => requireSuperAdmin(context),
  component: SuperAdminDashboard,
});

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Super Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <FileText className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Menu Designer</h3>
            <p className="text-gray-600 text-sm">Create 1000+ templates</p>
          </motion.div>

          {/* Video Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <Video className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Promo Videos</h3>
            <p className="text-gray-600 text-sm">Upload & manage videos</p>
          </motion.div>

          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <Users className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">User Management</h3>
            <p className="text-gray-600 text-sm">Manage restaurants & admins</p>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <Settings className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Global Settings</h3>
            <p className="text-gray-600 text-sm">App configuration</p>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <BarChart3 className="w-8 h-8 text-red-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View reports & stats</p>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-gray-700 transition cursor-pointer"
          >
            <FileText className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Gallery</h3>
            <p className="text-gray-600 text-sm">Upload images & 3D models</p>
          </motion.div>
        </div>

        {/* Role Badge */}
        <div className="mt-8 p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
          <p className="text-sm text-yellow-400">🔐 Super Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}

// src/routes/_authenticated.admin.restaurant-dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { requireRestaurantAdmin } from "@/middleware/roleMiddleware";

export const Route = createFileRoute("/_authenticated/admin/restaurant-dashboard")({
  beforeLoad: ({ context }) => requireRestaurantAdmin(context),
  component: RestaurantDashboard,
});

export default function RestaurantDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Restaurant Admin Dashboard</h1>
        <p className="text-gray-600">View your menu, manage items, and track orders</p>
        {/* Restaurant specific features */}
      </div>
    </div>
  );
}

// src/routes/unauthorized.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Lock className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate({ to: "/" })}
          className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
              }
