import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/menu/$slug")({
  component: MenuPage,
});

export default function MenuPage() {
  const { slug } = Route.useParams();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8">Menu - {slug}</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {["Pizza", "Burger", "Pasta", "Salad", "Dessert", "Drink"].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-gray-900 border border-gray-800"
            >
              <h3 className="text-2xl font-bold mb-2">{item}</h3>
              <p className="text-gray-400 mb-4">Delicious {item.toLowerCase()}</p>
              <p className="text-yellow-400 font-bold">₹299</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
