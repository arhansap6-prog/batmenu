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

        {/* Countdown / Controls */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
          {config.showCountdown && (
            <div className="text-white/70 text-sm">{remainingTime}s</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/60 backdrop-blur-xl border-t border-white/6 p-4 flex items-center justify-between">
        <div className="text-white/70 text-sm">{config.title}</div>
        <div className="flex items-center gap-2">
          {config.allowSkip && (
            <button onClick={handleSkip} className="px-3 py-1 rounded-lg bg-white/5 text-white/80">Skip</button>
          )}
        </div>
      </div>
    </div>
  );
}
