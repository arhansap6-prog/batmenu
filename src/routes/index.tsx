import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: PremiumLanding,
});

export default function PremiumLanding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("restaurant");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Fill all fields");
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    navigate({ to: "/_authenticated/admin" });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              className="w-16 h-16 rounded-2xl border-2 border-yellow-400 flex items-center justify-center mx-auto mb-6"
              whileHover={{ rotate: 10 }}
            >
              <span className="text-3xl font-black">B</span>
            </motion.div>
            <h1 className="text-4xl font-light tracking-wide mb-2">BAT MENU</h1>
            <p className="text-gray-600 text-sm uppercase tracking-[0.2em]">
              Luxury Digital Menus
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-900/50 p-1 rounded-full backdrop-blur-xl border border-gray-800">
            {["restaurant", "admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-full text-xs font-medium uppercase tracking-wide transition ${
                  activeTab === tab
                    ? "bg-white text-black"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {tab === "restaurant" ? "Restaurant" : "Admin"}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-700 outline-none focus:border-gray-700 focus:bg-gray-900/80 transition backdrop-blur-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-700 outline-none focus:border-gray-700 focus:bg-gray-900/80 transition backdrop-blur-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 bg-white text-black py-3 rounded-xl font-medium text-sm uppercase tracking-wide hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-gray-600">
              © 2026 BAT MENU • Enterprise Edition
            </p>
            <p className="text-xs text-gray-700">
              Powered by ARHXY
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
