import { useEffect, useRef, useState } from "react";
import { X, RotateCw, Camera, Maximize2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface AR3DProps {
  foodName: string;
  foodImage: string;
  onClose: () => void;
}

export function AR3DViewer({ foodName, foodImage, onClose }: AR3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [arSupported, setArSupported] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const initAR = async () => {
      try {
        const mediaStreamConstraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(
          mediaStreamConstraints
        );

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setLoading(false);
          };
        }
      } catch (error) {
        console.error("Camera error:", error);
        toast.error("Camera access denied");
        setArSupported(false);
        setLoading(false);
      }
    };

    initAR();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

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
    toast.success("View reset");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-black flex flex-col ${
        isFullscreen ? "" : "rounded-t-3xl"
      }`}
    >
      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {arSupported && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width={1280}
              height={720}
            />

            {/* 3D Food Overlay */}
            {!loading && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: zoom }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="text-9xl drop-shadow-lg">{foodImage}</div>
              </motion.div>
            )}

            {/* Loading Indicator */}
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
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="text-white text-sm">Initializing AR...</p>
                </motion.div>
              </div>
            )}

            {/* Zoom Controls */}
            {!loading && (
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
                  className="p-3 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition text-white"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                  className="p-3 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full transition text-white"
                >
                  −
                </button>
              </div>
            )}

            {/* Food Name Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-gray-800">
              <p className="text-white text-sm font-medium">{foodName}</p>
            </div>
          </>
        )}

        {!arSupported && (
          <div className="text-center px-6">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-white text-lg font-medium mb-2">AR Not Available</p>
            <p className="text-gray-600 text-sm mb-6">
              Your device doesn't support augmented reality
            </p>
            <div className="text-5xl mb-4">{foodImage}</div>
            <p className="text-gray-600 text-xs">2D Preview</p>
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
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white hover:bg-gray-800 transition"
            >
              <Maximize2 size={16} />
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
  );
}

export default AR3DViewer;

