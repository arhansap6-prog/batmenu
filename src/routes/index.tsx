import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});

export default function SplashScreen() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ opacity: 0, x: `${particle.x}vw`, y: `${particle.y}vh` }}
          animate={{ opacity: [0, 0.8, 0], y: [`${particle.y}vh`, `${particle.y - 20}vh`] }}
          transition={{ duration: 3, delay: particle.delay, repeat: Infinity }}
        />
      ))}

      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="w-32 h-32 rounded-full border-2 border-yellow-400 flex items-center justify-center mx-auto mb-8 relative"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-400 border-r-yellow-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-5xl font-black relative z-10">B</span>
        </motion.div>

        <motion.h1
          className="text-4xl font-light tracking-[0.25em] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          BAT MENU
        </motion.h1>

        <motion.p
          className="text-xs tracking-[0.3em] text-gray-500 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Enterprise Digital Menus
        </motion.p>

        <motion.div
          className="mt-8 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 2 }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-gray-800 text-xs uppercase tracking-[0.2em] font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1 }}
      >
        ARHXY © 2026
      </motion.div>
    </div>
  );
}
