import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Star, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";

interface Food {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  outOfStock?: boolean;
  rating?: number;
}

export default function FoodSearch() {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Mock data - replace with real API
  const foods: Food[] = [
    {
      id: "1",
      name: "Margherita Pizza",
      price: 450,
      description: "Fresh mozzarella, basil, tomato sauce",
      category: "Pizza",
      image: "🍕",
      isBestSeller: true,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Garlic Bread",
      price: 200,
      description: "Crispy bread with garlic butter",
      category: "Appetizers",
      image: "🍞",
      rating: 4.5,
    },
    {
      id: "3",
      name: "Pasta Carbonara",
      price: 550,
      description: "Creamy pasta with bacon",
      category: "Pasta",
      image: "🍝",
      isSpecial: true,
      rating: 4.9,
    },
  ];

  const filtered = useMemo(() => {
    if (!search.trim()) return foods;
    const query = search.toLowerCase();
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
    );
  }, [search, foods]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-4 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods, categories..."
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-10 pr-10 py-3 text-white placeholder:text-gray-600 outline-none focus:border-gray-700 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs text-gray-600 mt-2 ml-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3 mt-6">
        <AnimatePresence mode="wait">
          {filtered.length === 0 && search ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-gray-600"
            >
              <p className="text-sm">No foods match your search</p>
            </motion.div>
          ) : (
            filtered.map((food, idx) => (
              <motion.button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="w-full text-left"
              >
                <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition group">
                  <div className="flex gap-3">
                    <div className="text-4xl flex-shrink-0">{food.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white truncate">
                          {food.name}
                        </p>
                        {food.isBestSeller && (
                          <Star size={14} className="text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {food.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-yellow-400">
                            ₹{food.price}
                          </span>
                          {food.rating && (
                            <span className="text-xs text-gray-600">
                              ⭐ {food.rating}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(food.id);
                          }}
                          className="p-2 hover:bg-gray-800 rounded-lg transition"
                        >
                          <Heart
                            size={16}
                            className={
                              favorites.includes(food.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFood(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gray-900 border-t border-gray-800 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <div className="text-7xl mb-4">{selectedFood.image}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedFood.name}
                </h2>
                <p className="text-xs text-gray-600 uppercase tracking-widest">
                  {selectedFood.category}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-400 text-sm leading-relaxed text-center">
                  {selectedFood.description}
                </p>

                {selectedFood.isBestSeller && (
                  <div className="flex justify-center">
                    <span className="inline-block px-4 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs uppercase tracking-wider font-medium">
                      ⭐ Best Seller
                    </span>
                  </div>
                )}

                {selectedFood.isSpecial && (
                  <div className="flex justify-center">
                    <span className="inline-block px-4 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs uppercase tracking-wider font-medium">
                      🎯 Today's Special
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-yellow-400">
                    ₹{selectedFood.price}
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-medium uppercase tracking-wide hover:bg-gray-200 transition"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFood(null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-800 text-white font-medium uppercase tracking-wide hover:bg-gray-900 transition"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

