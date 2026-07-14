import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "batmenu.intro.shown";
const VIDEO_KEY = "batmenu.intro.video.shown";
const LOGO_SRC = "/batman-logo.png";
const LOGO_FALLBACK = "/72722-removebg-preview.png";

type PromoVideo = { id: string; video_url: string; show_skip_button: boolean };

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"pending" | "logo" | "video" | "done">("pending");
  const [logoSrc, setLogoSrc] = useState(LOGO_SRC);
  const [logoFailed, setLogoFailed] = useState(false);
  const [video, setVideo] = useState<{ url: string; showSkip: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let shownLogo = false;
      try { shownLogo = sessionStorage.getItem(KEY) === "1"; } catch { /* ignore */ }
      if (!shownLogo) {
        setPhase("logo");
        await new Promise((r) => setTimeout(r, 2200));
        try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
      }
      if (cancelled) return;

      // Try to play promo video (once ever)
      let videoShown = true;
      try { videoShown = localStorage.getItem(VIDEO_KEY) === "1"; } catch { /* ignore */ }
      if (!videoShown) {
        try {
          const { data } = await supabase
            .from("promotional_videos")
            .select("id, video_url, show_skip_button")
            .eq("enabled", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const v = data as PromoVideo | null;
          if (v?.video_url) {
            const { data: signed } = await supabase.storage
              .from("promo-videos")
              .createSignedUrl(v.video_url, 3600);
            if (signed?.signedUrl && !cancelled) {
              setVideo({ url: signed.signedUrl, showSkip: v.show_skip_button ?? true });
              setPhase("video");
              return;
            }
          }
        } catch { /* ignore, fall through */ }
      }
      if (!cancelled) setPhase("done");
    })();
    return () => { cancelled = true; };
  }, []);

  function finishVideo() {
    try { localStorage.setItem(VIDEO_KEY, "1"); } catch { /* ignore */ }
    setPhase("done");
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {phase === "logo" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black text-white"
            aria-hidden
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute inset-0 -z-10 rounded-full bg-white/10 blur-3xl" />
                {logoFailed ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-400 text-5xl font-black sm:h-28 sm:w-28">B</div>
                ) : (
                  <img
                    src={logoSrc}
                    className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                    alt="BAT MENU"
                    onError={() => {
                      if (logoSrc !== LOGO_FALLBACK) setLogoSrc(LOGO_FALLBACK);
                      else setLogoFailed(true);
                    }}
                  />
                )}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 18, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
                transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 font-display text-5xl sm:text-6xl"
              >BAT MENU</motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7 }}
                className="mt-4 text-[11px] uppercase tracking-[0.32em] text-white/70"
              >Premium Digital Menus For Restaurants</motion.p>
            </motion.div>
          </motion.div>
        )}

        {phase === "video" && video && (
          <motion.div
            key="promo-video"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
          >
            <video
              ref={videoRef}
              src={video.url}
              autoPlay
              playsInline
              controls={false}
              onEnded={finishVideo}
              onError={finishVideo}
              className="h-full w-full object-cover"
            />
            {video.showSkip && (
              <button
                onClick={finishVideo}
                className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-widest text-white backdrop-blur hover:bg-black/80"
              >Skip</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
