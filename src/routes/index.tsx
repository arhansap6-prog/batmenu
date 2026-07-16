import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  QrCode, 
  UtensilsCrossed, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  ArrowRight,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full"></div>
          </motion.div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍕</span>
              <span className="text-2xl font-bold">BAT MENU</span>
            </div>
            <Link
              to="/auth"
              className="px-6 py-2 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition"
            >
              Login
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-20"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">PREMIUM DIGITAL MENUS</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Transform Your Restaurant Menu
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                One permanent QR code. Beautiful digital menus. AR food preview. Real-time analytics. Everything restaurants need to succeed in 2025.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/auth"
                  className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </Link>
                <button className="px-8 py-4 border-2 border-gray-700 text-white rounded-lg font-bold hover:bg-gray-900 transition">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-400">Restaurants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">10M+</div>
                  <div className="text-sm text-gray-400">QR Scans</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </motion.div>

            {/* Right - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Load in <2 seconds" },
                { icon: Shield, title: "Enterprise Secure", desc: "Bank-level encryption" },
                { icon: BarChart3, title: "Real Analytics", desc: "Live insights & trends" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-gray-700 transition"
                >
                  <feature.icon className="w-8 h-8 text-yellow-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-gray-800"
        >
          <h2 className="text-5xl font-bold mb-12 text-center">Why Choose BAT MENU?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "📱", title: "Permanent QR", desc: "Never changes - print once, use forever" },
              { emoji: "🎨", title: "200+ Templates", desc: "Pre-designed for every restaurant type" },
              { emoji: "🍕", title: "AR Preview", desc: "Customers see 3D food on their table" },
              { emoji: "📊", title: "Analytics", desc: "Real-time insights on menu performance" },
              { emoji: "🎥", title: "Promo Videos", desc: "Auto-play before menu loads" },
              { emoji: "🔐", title: "Super Admin", desc: "Manage unlimited restaurants" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-gray-800 hover:border-yellow-400/30 transition hover:bg-gray-900/70"
              >
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center border-t border-gray-800"
        >
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Restaurant?</h2>
          <p className="text-xl text-gray-300 mb-8">Join 500+ restaurants using BAT MENU</p>
          <Link
            to="/auth"
            className="inline-block px-10 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition"
          >
            Start Free Trial
          </Link>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-gray-600">
            <p>© 2026 BAT MENU • Powered by ARHXY</p>
          </div>
        </footer>
      </div>
    );
  }

  // Logged in - show dashboard entry
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍕</span>
            <span className="text-2xl font-bold">BAT MENU</span>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-6 py-2 bg-gray-800 text-white rounded-full font-semibold text-sm hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-20"
      >
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Welcome to BAT MENU</h1>
          <p className="text-xl text-gray-400">Restaurant Management Dashboard</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Plus, title: "Create Menu", desc: "Build your digital menu", href: "#" },
            { icon: QrCode, title: "QR Menu", desc: "Manage QR codes", href: "#" },
            { icon: UtensilsCrossed, title: "Food Items", desc: "Add & edit food", href: "#" },
            { icon: ShoppingCart, title: "Orders", desc: "View all orders", href: "#" },
            { icon: BarChart3, title: "Analytics", desc: "View insights", href: "#" },
            { icon: Settings, title: "Settings", desc: "Configure restaurant", href: "#" },
          ].map((action, i) => (
            <motion.a
              key={i}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-yellow-400/50 transition hover:bg-gray-900/80 cursor-pointer group"
            >
              <action.icon className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2">{action.title}</h3>
              <p className="text-gray-400">{action.desc}</p>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-gray-600">
          <p>© 2026 BAT MENU • Powered by ARHXY</p>
        </div>
      </footer>
    </div>
  );
        }
