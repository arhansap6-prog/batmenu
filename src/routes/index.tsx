import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Users, Smartphone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-3xl font-bold">🍕 BAT MENU</div>
          <Link
            to="/auth"
            className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
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
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Premium Digital Menus for Every Restaurant
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              BAT MENU is the ultimate digital restaurant solution. One permanent QR code. Beautiful menus. AR food preview. Zero technical setup required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth"
                className="px-8 py-4 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                to="/menu/demo"
                className="px-8 py-4 border-2 border-gray-700 text-white rounded-lg font-bold hover:bg-gray-900 transition"
              >
                View Demo Menu
              </Link>
            </div>
          </motion.div>

          {/* Right - Feature Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400/50 transition">
              <Zap className="w-8 h-8 text-yellow-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Load in under 2 seconds. Optimized for mobile.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400/50 transition">
              <Smartphone className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Mobile First</h3>
              <p className="text-gray-400">Perfect on phones, tablets, and desktops.</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400/50 transition">
              <Users className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Super Easy</h3>
              <p className="text-gray-400">No coding needed. Manage everything from dashboard.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-7xl mx-auto px-4 py-20 border-t border-gray-800"
      >
        <h2 className="text-5xl font-bold mb-12 text-center">Packed with Premium Features</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "📱", title: "Permanent QR Code", desc: "One QR code that never changes. Print it once, use forever." },
            { icon: "🎨", title: "200+ Menu Templates", desc: "Beautiful designs for every restaurant type. Fully customizable." },
            { icon: "🍕", title: "AR 3D Preview", desc: "Customers see 3D food models on their table before ordering." },
            { icon: "📊", title: "Live Analytics", desc: "Track menu views, popular items, customer engagement." },
            { icon: "🎥", title: "Promotional Videos", desc: "Auto-play videos before customers see your menu." },
            { icon: "🔐", title: "Super Admin Control", desc: "Manage unlimited restaurants from one dashboard." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-yellow-400/50 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
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
        transition={{ delay: 1 }}
        className="max-w-4xl mx-auto px-4 py-20 text-center"
      >
        <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Restaurant?</h2>
        <p className="text-xl text-gray-400 mb-8">Join hundreds of restaurants using BAT MENU</p>

        <Link
          to="/auth"
          className="inline-block px-10 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-200 transition"
        >
          Start Free Trial
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2026 BAT MENU • Powered by ARHXY • Premium Digital Menu Platform</p>
        </div>
      </footer>
    </div>
  );
}
