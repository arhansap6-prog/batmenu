import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Trash2, Eye, Toggle2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface VideoData {
  url: string;
  enabled: boolean;
  duration: number;
}

export default function VideoManagement() {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be less than 500MB');
      return;
    }

    // Validate duration
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const url = event.target?.result as string;
        const video = new window.HTMLVideoElement();
        video.onloadedmetadata = () => {
          setVideo({
            url,
            enabled: true,
            duration: Math.round(video.duration)
          });
          toast.success('Video uploaded successfully!');
          setUploading(false);
        };
        video.src = url;
      } catch (error) {
        toast.error('Failed to process video');
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteVideo = () => {
    if (confirm('Delete this video? This cannot be undone.')) {
      setVideo(null);
      toast.success('Video deleted');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-display text-white mb-2">Promotional Video</h2>
        <p className="text-white/50 text-sm">Manage app launch video (1-3 minutes)</p>
      </div>

      {!video ? (
        // Upload Section
        <motion.div
          className="border-2 border-dashed border-white/20 rounded-3xl p-12 text-center cursor-pointer hover:border-white/40 transition"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={handleUpload}
            hidden
          />
          <Upload className="mx-auto mb-4 text-white/40" size={32} />
          <p className="text-white mb-2 font-medium">Upload Promotional Video</p>
          <p className="text-white/40 text-sm">MP4, WebM (max 500MB)</p>
          <p className="text-white/30 text-xs mt-2">Duration: 1-3 minutes</p>
        </motion.div>
      ) : (
        // Video Preview
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/20 overflow-hidden bg-black/50"
        >
          {/* Video Player */}
          <div className="relative w-full bg-black aspect-video flex items-center justify-center group">
            <video
              src={video.url}
              className="w-full h-full object-cover"
              controls
            />
            <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
              <Play className="text-white" size={48} />
            </button>
          </div>

          {/* Video Info */}
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/50 text-sm">Duration</p>
                <p className="text-white font-medium">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')} minutes
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm">Status</p>
                <p className={`font-medium ${video.enabled ? 'text-green-400' : 'text-white/50'}`}>
                  {video.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                onClick={() => setVideo({ ...video, enabled: !video.enabled })}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/8 border border-white/15 hover:bg-white/12 transition"
              >
                <span className="text-white text-sm">{video.enabled ? 'Disable' : 'Enable'} Video</span>
                <Toggle2 size={18} className="text-white/50" />
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white text-sm hover:bg-white/12 transition"
              >
                <Upload size={16} /> Replace Video
              </button>

              <button
                onClick={deleteVideo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/15 transition"
              >
                <Trash2 size={16} /> Delete Video
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-white/70 text-sm leading-relaxed">
          This video will play automatically when new users open the app for the first time. They can skip at any time.
        </p>
      </div>
    </div>
  );
}

