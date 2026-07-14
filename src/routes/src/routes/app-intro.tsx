import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { Volume2, VolumeX, X, SkipForward } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app-intro")({
  component: AppIntroVideo,
});

interface IntroVideoConfig {
  videoUrl: string;
  duration: number; // in seconds
  title: string;
  autoPlay: boolean;
  allowSkip: boolean;
  showCountdown: boolean;
}

export default function AppIntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const navigate = useNavigate();

  const config: IntroVideoConfig = {
    videoUrl: "/videos/bat-menu-intro.mp4", // Super Admin uploads this
    duration: 72, // 1 min 12 seconds
    title: "Welcome to BAT MENU",
    autoPlay: true,
    allowSkip: true,
    showCountdown: true,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleVideoEnd();
    }, config.duration * 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      });
      videoRef.current.addEventListener("loadedmetadata", () => {
        setDuration(videoRef.current?.duration || 0);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    toast.success("Welcome!");
    navigate({ to: "/" });
  };

  const handleSkip = () => {
    toast.info("Video skipped");
    navigate({ to: "/" });
  };

  const remainingTime = Math.ceil(config.duration - currentTime);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center group">
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay={config.autoPlay}
          muted={muted}
          onEnded={handleVideoEnd}
          playsInline
        >
          <source src={config.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Close Button */}
        {config.allowSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xl border border-gray-700 text-white transition"
          >
            <X size={20} />
          </motion.button>
        )}

        {/* Title Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-12 left-6 right-6 z-10"
        >
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {config.title}
          </h1>
          <p className="text-sm text-gray-300 mt-1 drop-shadow">
            Enterprise Digital Menu Platform
          </p>
        </motion.div>

        {/* Countdown Timer */}
        {config.showCountdown && showSkipButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-24 right-6 z-10 text-center"
          >
            <div className="text-4xl font-bold text-white drop-shadow-lg mb-2">
              {remainingTime}
            </div>
            <p className="text-xs text-gray-300">seconds remaining</p>
          </motion.div>
        )}

        {/* Skip Button */}
        {config.allowSkip && showSkipButton && remainingTime > 3 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm uppercase tracking-wide hover:bg-gray-200 transition drop-shadow-lg"
          >
            <SkipForward size={16} /> Skip Intro
          </motion.button>
        )}

        {/* Center Play Button (if paused) */}
        {!isPlaying && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              videoRef.current?.play();
              setIsPlaying(true);
            }}
            className="absolute inset-0 z-5 flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white flex items-center justify-center hover:bg-white/30 transition">
              <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1" />
            </div>
          </motion.button>
        )}
      </div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-xl border-t border-gray-800 p-4 space-y-4"
      >
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentTime / config.duration) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {Math.floor(currentTime / 60)}:
              {String(Math.floor(currentTime % 60)).padStart(2, "0")}
            </span>
            <span>
              {Math.floor(config.duration / 60)}:
              {String(Math.floor(config.duration % 60)).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMuted(!muted)}
            className="p-3 rounded-full hover:bg-gray-800 transition text-white"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                videoRef.current?.pause();
                setIsPlaying(false);
              }}
              className="px-6 py-2 rounded-full border border-gray-700 text-white text-sm font-medium hover:bg-gray-900 transition"
            >
              Pause
            </motion.button>
            {config.allowSkip && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition"
              >
                Skip
              </motion.button>
            )}
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-600 text-center">
          🎯 Powered by ARHXY • Super Admin can upload custom intro videos
        </p>
      </motion.div>
    </div>
  );
}

