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
