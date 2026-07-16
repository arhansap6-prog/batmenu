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
