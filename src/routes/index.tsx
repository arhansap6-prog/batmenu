import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Users, Smartphone } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          {/* Logo */}
          <motion.div
            className="text-7xl mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            🍕
          </motion.div>

          {/* Title */}
          <h1 className="text-6xl font-bold mb-4">BAT MENU</h1>
          <p className="text-xl text-gray-400 mb-8">
            Premium Digital Restaurant Menus for Every Food Business
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm">Lightning Fast</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <Smartphone className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm">Mobile First</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm">Easy to Use</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              to="/auth"
              className="block w-full px-8 py-4 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link
              to="/menu/demo"
              className="block w-full px-8 py-4 border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 transition"
            >
              View Demo
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-8 text-gray-600 text-sm">
            © 2026 BAT MENU • Powered by ARHXY
          </p>
        </motion.div>
      </div>
    </div>
  );
}
