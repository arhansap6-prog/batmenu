import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  ar3dModel?: string;
  enable3d: boolean;
}

export function FoodImageManager() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (foodId: string, file: File) => {
    if (!file.type.startsWith("image")) {
      toast.error("File must be an image");
      return;
    }

    // Compress image
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);

    setFoods(
      foods.map((f) =>
        f.id === foodId ? { ...f, images: [...f.images, url] } : f
      )
    );
    toast.success("Image added to menu!");
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if too large
          if (width > 1200) {
            height = (height * 1200) / width;
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(resolve, "image/jpeg", 0.8);
        };
      };
    });
  };

  const handleDeleteImage = (foodId: string, imageIndex: number) => {
    setFoods(
      foods.map((f) =>
        f.id === foodId
          ? { ...f, images: f.images.filter((_, i) => i !== imageIndex) }
          : f
      )
    );
    toast.success("Image removed");
  };

  const handleAddFood = () => {
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: "New Dish",
      category: "Main Course",
      price: 0,
      description: "",
      images: [],
      enable3d: false,
    };
    setFoods([...foods, newFood]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Food Images</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddFood}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200"
        >
          Add Food Item
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition"
          >
            {/* Images Grid */}
            {food.images.length === 0 ? (
              <div className="mb-4 h-40 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center bg-black/30">
                <label className="cursor-pointer text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(food.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs text-gray-600">Upload image</p>
                </label>
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {food.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${food.name} ${idx}`}
                      className="w-full h-20 object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(food.id, idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Food Details */}
            <input
              type="text"
              value={food.name}
              onChange={(e) =>
                setFoods(
                  foods.map((f) => (f.id === food.id ? { ...f, name: e.target.value } : f))
                )
              }
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white mb-2 outline-none focus:border-gray-600"
              placeholder="Food name"
            />

            <input
              type="number"
              value={food.price}
              onChange={(e) =>
                setFoods(
                  foods.map((f) =>
                    f.id === food.id ? { ...f, price: Number(e.target.value) } : f
                  )
                )
              }
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white mb-2 outline-none focus:border-gray-600"
              placeholder="Price"
            />

            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={food.enable3d}
                  onChange={(e) =>
                    setFoods(
                      foods.map((f) =>
                        f.id === food.id ? { ...f, enable3d: e.target.checked } : f
                      )
                    )
                  }
                  className="w-4 h-4"
                />
                <span className="text-gray-400">Enable AR 3D</span>
              </label>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// src/components/AR3DTableView.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, RotateCw, Camera, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface AR3DProps {
  foodName: string;
  foodEmoji: string;
  onClose: () => void;
}

export function AR3DTableView({ foodName, foodEmoji, onClose }: AR3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [arSupported, setArSupported] = useState(true);
  const [muted, setMuted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    initAR();
  }, []);

  const initAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setLoading(false);
        };
      }
    } catch (error) {
      toast.error("Camera access denied");
      setArSupported(false);
      setLoading(false);
    }
  };

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = `${foodName}-ar-${Date.now()}.png`;
        link.click();
        toast.success("Photo captured!");
      }
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    toast.success("View reset");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          {arSupported ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
              <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

              {/* 3D Food Overlay */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: zoom,
                    rotate: rotation,
                  }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <div className="text-9xl drop-shadow-2xl">{foodEmoji}</div>
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-white text-sm">Initializing AR...</p>
                  </motion.div>
                </div>
              )}

              {/* Food Name Badge */}
              <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-gray-800">
                <p className="text-white text-sm font-medium">{foodName}</p>
              </div>

              {/* Zoom Controls */}
              {!loading && (
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition text-white text-lg font-bold"
                  >
                    +
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition text-white text-lg font-bold"
                  >
                    −
                  </motion.button>
                </div>
              )}

              {/* Rotation Controls */}
              {!loading && (
                <div className="absolute bottom-32 right-6 flex flex-col gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRotation(rotation + 45)}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition text-white"
                  >
                    ⟳
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-white text-lg font-medium mb-2">AR Not Available</p>
              <p className="text-gray-600 text-sm mb-6">2D Preview</p>
              <div className="text-9xl">{foodEmoji}</div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        {!loading && arSupported && (
          <div className="bg-black/60 backdrop-blur-xl border-t border-gray-800 p-4 space-y-3">
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm hover:bg-gray-800 transition"
              >
                <RotateCw size={16} /> Reset
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCapture}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm hover:bg-gray-800 transition"
              >
                <Camera size={16} /> Capture
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMuted(!muted)}
                className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white hover:bg-gray-800 transition"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </motion.button>
            </div>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition"
            >
              <X size={16} /> Close AR
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// src/routes/_authenticated.customer.menu.$slug.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, Eye } from "lucide-react";
import { AR3DTableView } from "@/components/AR3DTableView";
import { PromoVideoDisplay } from "@/components/PromoVideoDisplay";

export const Route = createFileRoute("/_authenticated/customer/menu/$slug")({
  component: CustomerMenu,
});

interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  enable3d: boolean;
  isBestSeller?: boolean;
  isSpecial?: boolean;
}

export default function CustomerMenu() {
  const [showPromoVideo, setShowPromoVideo] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: "1",
      name: "Margherita Pizza",
      emoji: "🍕",
      price: 450,
      description: "Fresh mozzarella, basil, tomato sauce",
      category: "Pizza",
      images: [],
      enable3d: true,
      isBestSeller: true,
    },
    {
      id: "2",
      name: "Spicy Burger",
      emoji: "🍔",
      price: 350,
      description: "Juicy burger with spicy mayo",
      category: "Burgers",
      images: [],
      enable3d: true,
      isSpecial: true,
    },
    {
      id: "3",
      name: "Chocolate Cake",
      emoji: "🍰",
      price: 250,
      description: "Rich chocolate layer cake",
      category: "Desserts",
      images: [],
      enable3d: true,
    },
  ];

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Promo Video */}
      <AnimatePresence>
        {showPromoVideo && (
          <PromoVideoDisplay
            videoUrl="/videos/promo.mp4"
            videoName="Welcome to Restaurant"
            onComplete={() => setShowPromoVideo(false)}
            allowSkip={true}
            mandatory={false}
            muteAudio={false}
          />
        )}
      </AnimatePresence>

      {/* Menu Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Menu</h1>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["Pizza", "Burgers", "Desserts", "Drinks"].map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-sm whitespace-nowrap transition"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedItem(item)}
              className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-5xl">{item.emoji}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <Heart
                    size={20}
                    className={
                      favorites.includes(item.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }
                  />
                </button>
              </div>

              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{item.category}</p>
              <p className="text-sm text-gray-400 mb-4">{item.description}</p>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-yellow-400">₹{item.price}</span>
                {item.enable3d && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                      setShowAR(true);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                  >
                    <Eye size={14} /> View 3D
                  </button>
                )}
              </div>

              {item.isBestSeller && (
                <span className="mt-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                  ⭐ Best Seller
                </span>
              )}
              {item.isSpecial && (
                <span className="mt-1 text-xs bg-red-400/20 text-red-400 px-2 py-1 rounded">
                  🔥 Today's Special
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* AR 3D View */}
      <AnimatePresence>
        {showAR && selectedItem && (
          <AR3DTableView
            foodName={selectedItem.name}
            foodEmoji={selectedItem.emoji}
            onClose={() => setShowAR(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

