import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BatLogo } from "@/lib/brand";

const KEY = "batmenu.intro.shown";

export function IntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") { setPhase("done"); return; }
    } catch { /* ignore */ }
    setPhase("playing");
    const t = setTimeout(() => {
      try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
      setPhase("done");
    }, 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black text-white"
            aria-hidden
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute inset-0 -z-10 rounded-full bg-white/10 blur-3xl" />
                <img
                  <img
  src="/batman-logo.png?v=1"
  className="h-24 w-24 sm:h-28 sm:w-28"
  alt="Logo"
/>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
                transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 font-display text-5xl sm:text-6xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                BAT MENU
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 1.6, duration: 0.9 }}
                className="mt-4 text-[11px] uppercase tracking-[0.32em] text-white/70"
              >
                Premium Digital Menus For Restaurants
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 h-px w-40 origin-left bg-white/40"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
