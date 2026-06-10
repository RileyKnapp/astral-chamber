import { useAppState } from "@/lib/app-state";

export function PremiumLock({ feature, description }: { feature: string; description: string }) {
  const { hasPremiumAccess, unlockDemoPremium } = useAppState();
  if (hasPremiumAccess) return null;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
        paddingTop: "calc(env(safe-area-inset-top) + 4rem)",
      }}
    >
      <div className="w-full max-w-md rounded-sm border border-[#c0b0f0]/35 bg-black/20 p-6 text-center">
        <div className="text-2xl text-[#c0b0f0]">◇</div>
        <div className="mt-4 text-[10px] tracking-[0.35em] text-[#8ab8f0]">PREMIUM CHAMBER</div>
        <h1 className="mt-3 font-serif text-3xl text-white">{feature}</h1>
        <p className="mt-4 text-[12px] leading-relaxed text-[#cfe7ff]/75">{description}</p>
        <button
          type="button"
          onClick={unlockDemoPremium}
          className="mt-6 w-full rounded-sm border border-[#c0b0f0]/50 bg-[#c0b0f0]/10 px-4 py-3 text-[10px] font-bold tracking-[0.2em] text-[#c0b0f0] transition hover:bg-[#c0b0f0]/20"
        >
          PURCHASE PREMIUM TO ACCESS
        </button>
      </div>
    </div>
  );
}
