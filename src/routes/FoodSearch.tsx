import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Star, ShoppingBag } from 'lucide-react';

interface Food {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isBestSeller?: boolean;
  isSpecial?: boolean;
  outOfStock?: boolean;
}

interface SearchProps {
  foods: Food[];
  onFoodSelect: (food: Food) => void;
}

export default function FoodSearch({ foods, onFoodSelect }: SearchProps) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const filtered = useMemo(() => {
    if (!search) return foods;
    return foods.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, foods]);

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/8 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods..."
            className="w-full bg-white/8 border border-white/15 rounded-2xl pl-10 pr-10 py-3 text-white placeholder:text-white/30 focus:border-white/40 outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {search && (
          <p className="text-[11px] text-white/40 mt-2">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Results */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && search ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-white/40"
            >
              <p className="text-sm">No foods match your search</p>
            </motion.div>
          ) : (
            filtered.map((food) => (
              <motion.button
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  onFoodSelect(food);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex gap-3 p-3 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/8 transition"
              >
                <div className="h-16 w-16 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden">
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{food.name}</p>
                    {food.isBestSeller && <Star size={12} className="text-yellow-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[12px] text-white/50 truncate">{food.category}</p>
                  <p className="text-sm text-white/70 mt-1 font-medium">₹{food.price}</p>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <FoodDetailModal
            food={selectedFood}
            onClose={() => setSelectedFood(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FoodDetailModal({ food, onClose }: { food: Food; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-gradient-to-b from-white/10 to-black border-t border-white/20 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-display text-white flex-1">{food.name}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image */}
        <div className="w-full h-48 rounded-2xl bg-white/8 overflow-hidden mb-4">
          <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[12px] uppercase tracking-wider text-white/50">{food.category}</span>
            <span className="text-xl font-bold text-yellow-400">₹{food.price}</span>
          </div>

          <p className="text-white/70 text-sm leading-relaxed">{food.description}</p>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {food.isBestSeller && (
              <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-[10px] uppercase tracking-wider">
                Best Seller
              </span>
            )}
            {food.isSpecial && (
              <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-[10px] uppercase tracking-wider">
                Today's Special
              </span>
            )}
            {food.outOfStock && (
              <span className="px-3 py-1 bg-red-400/20 text-red-400 rounded-full text-[10px] uppercase tracking-wider">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition">
            View in 3D AR
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

