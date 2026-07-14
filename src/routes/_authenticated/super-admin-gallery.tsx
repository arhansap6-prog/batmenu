import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Play, Trash2, Eye, Download, Settings, FileVideo, Image } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/super-admin-gallery")({
  component: SuperAdminGallery,
});

interface GalleryItem {
  id: string;
  name: string;
  type: "video" | "image";
  url: string;
  size: number;
  uploadedAt: string;
  duration?: number;
  preview?: string;
}

export default function SuperAdminGallery() {
  const [videos, setVideos] = useState<GalleryItem[]>([
    {
      id: "1",
      name: "BAT MENU Intro",
      type: "video",
      url: "/videos/intro.mp4",
      size: 45000000,
      uploadedAt: "2026-07-14",
      duration: 72,
    },
  ]);

  const [backgrounds, setBackgrounds] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"videos" | "backgrounds">("videos");

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000000) {
      toast.error("Video too large (max 500MB)");
      return;
    }

    if (!file.type.startsWith("video")) {
      toast.error("File must be a video");
      return;
    }

    const newVideo: GalleryItem = {
      id: Date.now().toString(),
      name: file.name,
      type: "video",
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date().toISOString().split("T")[0],
      duration: 0,
    };

    setVideos([...videos, newVideo]);
    toast.success(`Video "${file.name}" uploaded!`);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image")) {
      toast.error("File must be an image");
      return;
    }

    const newBg: GalleryItem = {
      id: Date.now().toString(),
      name: file.name,
      type: "image",
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    setBackgrounds([...backgrounds, newBg]);
    toast.success(`Background "${file.name}" uploaded!`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDelete = (id: string, type: "video" | "background") => {
    if (type === "video") {
      setVideos(videos.filter(v => v.id !== id));
    } else {
      setBackgrounds(backgrounds.filter(b => b.id !== id));
    }
    toast.success("Item deleted");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Super Admin Gallery</h1>
          <p className="text-gray-600">Upload custom videos and menu backgrounds</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "videos"
                ? "text-white border-white"
                : "text-gray-600 border-transparent hover:text-gray-400"
            }`}
          >
            <FileVideo className="inline mr-2" size={18} />
            Intro Videos
          </button>
          <button
            onClick={() => setActiveTab("backgrounds")}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "backgrounds"
                ? "text-white border-white"
                : "text-gray-600 border-transparent hover:text-gray-400"
            }`}
          >
            <Image className="inline mr-2" size={18} />
            Menu Backgrounds
          </button>
        </div>

        {/* Video Tab */}
        {activeTab === "videos" && (
          <div>
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-8 rounded-2xl border-2 border-dashed border-gray-800 hover:border-gray-700 transition text-center bg-gray-900/30"
            >
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">Upload Intro Video</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Max 500MB • MP4, WebM, MOV • Recommended: 1.2 minutes (72 seconds)
                </p>
                <button className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200">
                  Choose Video
                </button>
              </label>
            </motion.div>

            {/* Videos List */}
            <div className="space-y-4">
              {videos.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No videos uploaded yet</p>
              ) : (
                videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Play size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{video.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {video.duration} seconds • {formatFileSize(video.size)} • Uploaded {video.uploadedAt}
                        </p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">
                            Current Intro
                          </span>
                          <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded">
                            ✓ Active
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
                          <Eye size={18} />
                        </button>
                        <button className="p-3 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white">
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id, "video")}
                          className="p-3 hover:bg-red-900/30 rounded-lg transition text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Video Settings */}
            <div className="mt-8 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Settings size={18} /> Video Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Auto-play on App Launch</label>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Allow Skip Button</label>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Show Countdown Timer</label>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backgrounds Tab */}
        {activeTab === "backgrounds" && (
          <div>
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-8 rounded-2xl border-2 border-dashed border-gray-800 hover:border-gray-700 transition text-center bg-gray-900/30"
            >
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">Upload Menu Backgrounds</h3>
                <p className="text-gray-600 text-sm mb-4">
                  PNG, JPG, WebP • Recommended: 1920x1080 or higher
                </p>
                <button className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200">
                  Choose Image
                </button>
              </label>
            </motion.div>

            {/* Backgrounds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backgrounds.length === 0 ? (
                <p className="col-span-full text-gray-600 text-center py-8">No backgrounds uploaded yet</p>
              ) : (
                backgrounds.map((bg) => (
                  <motion.div
                    key={bg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-black relative overflow-hidden">
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition"
                      />
                    </div>
                    <div className="p-3 bg-gray-900/50">
                      <p className="font-medium text-sm mb-2">{bg.name}</p>
                      <p className="text-xs text-gray-600 mb-3">{formatFileSize(bg.size)}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 p-2 hover:bg-gray-800 rounded text-xs transition">
                          <Eye size={14} className="inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleDelete(bg.id, "background")}
                          className="flex-1 p-2 hover:bg-red-900/30 text-red-400 rounded text-xs transition"
                        >
                          <Trash2 size={14} className="inline mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

