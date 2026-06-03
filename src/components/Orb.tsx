import { motion } from "motion/react";

export function Orb({
  beatHz,
  active,
  size = 220,
}: {
  beatHz: number;
  active: boolean;
  size?: number;
}) {
  // Slower pulse for lower frequencies feels right.
  const period = Math.max(0.6, 8 / Math.max(1, beatHz));
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(196,181,253,0.55), rgba(125,211,252,0.15) 55%, transparent 72%)",
          filter: "blur(2px)",
        }}
        animate={
          active
            ? { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
            : { scale: 1, opacity: 0.6 }
        }
        transition={{
          duration: period,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute rounded-full border border-white/20"
        style={{ width: size * 0.7, height: size * 0.7 }}
        animate={
          active
            ? { scale: [1, 1.12, 1], opacity: [0.45, 0.1, 0.45] }
            : { opacity: 0.3 }
        }
        transition={{ duration: period * 1.4, repeat: Infinity }}
      />
      <div
        className="rounded-full"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          background:
            "radial-gradient(circle at 50% 40%, #fff 0%, #c4b5fd 35%, #6366f1 75%, #1e1b4b 100%)",
          boxShadow: "0 0 60px rgba(167,139,250,0.5)",
        }}
      />
    </div>
  );
}
