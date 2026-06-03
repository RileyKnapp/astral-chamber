import { useEffect, useRef } from "react";
import { audioEngine } from "@/lib/audio/engine";

type Props = {
  height?: number;
  className?: string;
};

/**
 * Live spectrum visualizer reading from the engine's AnalyserNode.
 * Draws the actual frequency spectrum — what you see IS what you hear.
 */
export function Visualizer({ height = 160, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const analyser = audioEngine.getAnalyser();
      const audioCtx = audioEngine.getContext();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (!analyser || !audioCtx) {
        // idle: subtle aurora line
        const t = performance.now() / 1000;
        ctx.strokeStyle = "rgba(140,120,220,0.18)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.02 + t) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        raf = requestAnimationFrame(draw);
        return;
      }

      const bins = analyser.frequencyBinCount;
      const data = new Uint8Array(bins);
      analyser.getByteFrequencyData(data);

      const sampleRate = audioCtx.sampleRate;
      const nyquist = sampleRate / 2;
      // Show 0..600 Hz to highlight carrier+beat region
      const maxHz = 600;
      const maxBin = Math.floor((maxHz / nyquist) * bins);

      // Glow gradient bars
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(180,140,255,0.95)");
      grad.addColorStop(0.5, "rgba(120,180,255,0.7)");
      grad.addColorStop(1, "rgba(80,90,200,0.1)");
      ctx.fillStyle = grad;

      const barCount = 96;
      const barW = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const startBin = Math.floor((i / barCount) * maxBin);
        const endBin = Math.floor(((i + 1) / barCount) * maxBin);
        let sum = 0;
        for (let b = startBin; b < endBin; b++) sum += data[b] || 0;
        const avg = sum / Math.max(1, endBin - startBin);
        const v = avg / 255;
        const bh = Math.pow(v, 0.85) * (h - 8);
        const x = i * barW;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x + 0.5, h - bh, barW - 1, bh);
      }

      // Mirror reflection
      ctx.globalAlpha = 0.15;
      ctx.save();
      ctx.scale(1, -0.4);
      ctx.translate(0, -h * 2);
      for (let i = 0; i < barCount; i++) {
        const startBin = Math.floor((i / barCount) * maxBin);
        const endBin = Math.floor(((i + 1) / barCount) * maxBin);
        let sum = 0;
        for (let b = startBin; b < endBin; b++) sum += data[b] || 0;
        const avg = sum / Math.max(1, endBin - startBin);
        const v = avg / 255;
        const bh = Math.pow(v, 0.85) * (h - 8);
        const x = i * barW;
        ctx.fillRect(x + 0.5, h - bh, barW - 1, bh);
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height }}
    />
  );
}
