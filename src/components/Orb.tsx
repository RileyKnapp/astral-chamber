import { motion } from "motion/react";

type Props = {
  beatHz: number;
  active: boolean;
  size?: number;
};

/**
 * Breathing portal. Pulses at the beat frequency (clamped) so the
 * orb literally moves with the audio. Below 1 Hz, the period would
 * be too long — we still keep the slow rhythm because that IS the feel.
 */
export function Orb({ beatHz, active, size = 240 }: Props) {
  const period = Math.max(0.6, Math.min(6, 1 / Math.max(0.4, beatHz / 6)));
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer aurora */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(140,110,255,0.55) 0%, rgba(60,80,200,0.25) 45%, transparent 70%)",
        }}
        animate={{ scale: active ? [1, 1.18, 1] : 1, opacity: active ? [0.7, 1, 0.7] : 0.45 }}
        transition={{ duration: period, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Mid halo */}
      <motion.div
        className="absolute rounded-full blur-2xl"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background:
            "radial-gradient(circle, rgba(180,200,255,0.5) 0%, rgba(120,80,220,0.2) 60%, transparent 80%)",
        }}
        animate={{ scale: active ? [1, 1.08, 1] : 1 }}
        transition={{ duration: period * 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Core */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.45,
          height: size * 0.45,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.7) 30%, rgba(80,60,180,0.5) 70%, rgba(20,10,60,0.9) 100%)",
          boxShadow:
            "0 0 60px rgba(160,140,255,0.6), inset 0 0 40px rgba(255,255,255,0.2)",
        }}
        animate={{
          scale: active ? [1, 1.06, 1] : 1,
          opacity: active ? [0.95, 1, 0.95] : 0.85,
        }}
        transition={{ duration: period, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: size * 0.95,
          height: size * 0.95,
          borderColor: "rgba(200,180,255,0.12)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
