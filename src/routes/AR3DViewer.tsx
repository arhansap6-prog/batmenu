import { useEffect, useRef, useState } from 'react';
import { X, RotateCw, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface AR3DProps {
  foodName: string;
  model3DUrl: string;
  onClose: () => void;
}

export default function AR3DViewer({ foodName, model3DUrl, onClose }: AR3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [arSupported, setArSupported] = useState(true);

  useEffect(() => {
    // Check AR support
    const checkARSupport = async () => {
      try {
        const hasAR = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        setArSupported(hasAR);
        
        if (!hasAR) {
          toast.error('AR not supported on this device');
          return;
        }

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        
        setLoading(false);
      } catch (error) {
        toast.error('Camera access denied');
        setArSupported(false);
      }
    };

    checkARSupport();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera View */}
      <div
        ref={containerRef}
        className="flex-1 bg-black relative overflow-hidden"
        id="ar-container"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-sm">Loading 3D model...</p>
            </div>
          </div>
        )}

        {!arSupported && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur">
            <div className="text-center px-6">
              <p className="text-white mb-4">AR not available on this device</p>
              <p className="text-white/50 text-sm mb-6">View 2D preview instead</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 3D Model Placeholder */}
        {arSupported && !loading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-2xl bg-white/10 mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🍕</span>
              </div>
              <p className="text-white">{foodName}</p>
              <p className="text-white/50 text-xs mt-2">3D model rendering...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {arSupported && !loading && (
        <div className="bg-black/60 backdrop-blur-xl border-t border-white/20 p-4 space-y-3">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition">
              <RotateCw size={16} /> Reset
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition">
              <Camera size={16} /> Capture
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition"
          >
            <X size={16} /> Back
          </button>
        </div>
      )}
    </div>
  );
}

