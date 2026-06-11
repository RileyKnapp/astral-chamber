import { useAppState } from "@/lib/app-state";
import { PaywallPanel } from "@/components/PaywallPanel";

export function PremiumLock({ feature, description }: { feature: string; description: string }) {
  const { hasPremiumAccess, onboarding, resetOnboarding } = useAppState();
  if (hasPremiumAccess) return null;

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-24 font-mono text-[#cfe7ff]"
      style={{
        background: "radial-gradient(ellipse at top, #1a0510 0%, #050811 45%, #02050d 100%)",
        paddingTop: "calc(env(safe-area-inset-top) + 4rem)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <div className="text-[9px] tracking-[0.35em] text-[#8ab8f0]">LOCKED THRESHOLD</div>
          <h1 className="mt-2 font-serif text-3xl text-white">{feature}</h1>
          <p className="mt-3 text-[11px] leading-relaxed text-[#cfe7ff]/65">{description}</p>
        </div>
        <PaywallPanel intention={onboarding.intention} compact />
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={resetOnboarding}
            className="mt-6 w-full text-center text-[8px] tracking-[0.22em] text-white/30"
          >
            REPLAY ONBOARDING PREVIEW
          </button>
        )}
      </div>
    </div>
  );
}
