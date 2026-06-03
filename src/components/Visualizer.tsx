import { useEffect, useRef } from "react";
import { audioEngine } from "@/lib/audio/engine";

export function Visualizer({ height = 90 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const draw = () => {
      const analyser = audioEngine.getAnalyser();
      const w = canvas.offsetWidth;
      const h = height;
      ctx.clearRect(0, 0, w, h);
      if (!analyser) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const buf = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(buf);
      ctx.lineWidth = 1.5;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(196,181,253,0.9)");
      grad.addColorStop(1, "rgba(125,211,252,0.9)");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      const slice = w / buf.length;
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i] / 128 - 1;
        const y = h / 2 + v * (h / 2.4);
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * slice, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}
