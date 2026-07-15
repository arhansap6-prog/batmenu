import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Play, Trash2, Settings, Eye } from "lucide-react";
import { toast } from "sonner";
import { requireSuperAdmin } from "@/middleware/roleMiddleware";

export const Route = createFileRoute("/_authenticated/admin/video-manager")({
  beforeLoad: ({ context }) => requireSuperAdmin(context),
  component: VideoManager,
});

interface PromoVideo {
  id: string;
  name: string;
  url: string;
  duration: number;
  uploadedAt: string;
  fileSize: number;
  settings: {
    displayFrequency: "every_launch" | "once_per_day" | "once_per_user" | "never";
    mandatory: boolean;
    allowSkip: boolean;
    muteAudio: boolean;
  };
}

export default function VideoManager() {
  const [videos, setVideos] = useState<PromoVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<PromoVideo | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 500000000) {
      toast.error("Video too large (max 500MB)");
      return;
    }

    if (!file.type.startsWith("video")) {
      toast.error("File must be a video");
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase storage
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const newVideo: PromoVideo = {
        id: Date.now().toString(),
        name: file.name,
        url: data.url,
        duration: 0,
        uploadedAt: new Date().toISOString().split("T")[0],
        fileSize: file.size,
        settings: {
          displayFrequency: "every_launch",
          mandatory: true,
          allowSkip: true,
          muteAudio: false,
        },
      };

      setVideos([...videos, newVideo]);
      toast.success(`Video "${file.name}" uploaded!`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSettingsChange = (videoId: string, settings: Partial<PromoVideo["settings"]>) => {
    setVideos(
      videos.map((v) =>
        v.id === videoId ? { ...v, settings: { ...v.settings, ...settings } } : v
      )
    );
    toast.success("Settings updated");
  };

  const handleDelete = (id: string) => {
    setVideos(videos.filter((v) => v.id !== id));
    toast.success("Video deleted");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Promo Video Manager</h1>
          <p className="text-gray-600">Upload and manage promotional videos</p>
        </div>

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
              disabled={uploading}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2">Upload Promo Video</h3>
            <p className="text-gray-600 text-sm mb-4">
              Max 500MB • MP4, WebM, MOV • Recommended: 30-120 seconds
            </p>
            <button
              disabled={uploading}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Choose Video"}
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
                className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{video.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatFileSize(video.fileSize)} • Uploaded {video.uploadedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 p-4 rounded-xl bg-black/50">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Frequency</label>
                    <select
                      value={video.settings.displayFrequency}
                      onChange={(e) =>
                        handleSettingsChange(video.id, {
                          displayFrequency: e.target.value as any,
                        })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-600"
                    >
                      <option value="every_launch">Every App Launch</option>
                      <option value="once_per_day">Once Per Day</option>
                      <option value="once_per_user">Once Per User</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={video.settings.mandatory}
                        onChange={(e) =>
                          handleSettingsChange(video.id, { mandatory: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Mandatory (no skip)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={video.settings.allowSkip}
                        onChange={(e) =>
                          handleSettingsChange(video.id, { allowSkip: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Allow Skip</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={video.settings.muteAudio}
                        onChange={(e) =>
                          handleSettingsChange(video.id, { muteAudio: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Mute Audio</span>
                    </label>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                    <p className="text-xs text-yellow-400">
                      ✓ Active Video - Will show to customers before menu
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Global Settings */}
        <div className="mt-8 p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={20} /> Global Video Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Show video before customer menu</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Show countdown timer</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Remember user watched video</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/PromoVideoDisplay.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, SkipForward, X } from "lucide-react";

interface PromoVideoProps {
  videoUrl: string;
  videoName: string;
  onComplete: () => void;
  allowSkip: boolean;
  mandatory: boolean;
  muteAudio: boolean;
}

export function PromoVideoDisplay({
  videoUrl,
  videoName,
  onComplete,
  allowSkip,
  mandatory,
  muteAudio,
}: PromoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(muteAudio);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => onComplete();

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (allowSkip) {
      onComplete();
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const remainingTime = Math.ceil(duration - currentTime);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Video */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted={muted}
            playsInline
          />

          {/* Close Button */}
          {!mandatory && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onComplete}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
            >
              <X size={20} />
            </motion.button>
          )}

          {/* Countdown */}
          {allowSkip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-32 right-6 text-center"
            >
              <div className="text-3xl font-bold text-white drop-shadow-lg mb-1">
                {remainingTime}s
              </div>
              <p className="text-xs text-gray-300">remaining</p>
            </motion.div>
          )}

          {/* Skip Button */}
          {allowSkip && remainingTime > 3 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleSkip}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition"
            >
              <SkipForward size={16} /> Skip
            </motion.button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-black/60 backdrop-blur-xl border-t border-gray-800 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {Math.floor(currentTime / 60)}:
                {String(Math.floor(currentTime % 60)).padStart(2, "0")}
              </span>
              <span>
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setMuted(!muted)}
              className="p-3 hover:bg-gray-800 rounded-full text-white transition"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <p className="text-xs text-gray-600">{videoName}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

