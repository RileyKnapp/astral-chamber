import { useCallback } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAppState } from "@/lib/app-state";
import { LockKeyhole } from "lucide-react";

export function BottomNav() {
  const { hasPremiumAccess } = useAppState();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[120] px-4 before:pointer-events-none before:absolute before:inset-x-0 before:-top-7 before:bottom-0 before:bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,5,13,0.96)_28%,#02050d_100%)]"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="relative mx-auto flex max-w-2xl items-stretch gap-1 rounded-[28px] border border-white/15 bg-[#070411]/85 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55),0_0_28px_rgba(192,176,240,0.12)] backdrop-blur-2xl">
        {hasPremiumAccess ? (
          <>
            <NavItem to="/" label="CHAMBER" />
            <NavItem to="/journeys" label="JOURNEYS" />
            <NavItem to="/journal" label="DREAM LAB" />
            <NavItem to="/guides" label="GUIDES" />
          </>
        ) : (
          <>
            <NavItem to="/" label="CHAMBER" className="!flex-none w-[31%]" />
            <div className="relative flex min-w-0 flex-1 items-stretch rounded-[22px] border border-white/8 bg-black/20 pt-2">
              <div className="pointer-events-none absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center">
                <span className="flex h-5 w-7 items-center justify-center rounded-full border border-white/15 bg-[#0b0814] text-white/35 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  <LockKeyhole className="h-2.5 w-2.5" strokeWidth={1.6} />
                </span>
              </div>
              <NavItem to="/journeys" label="JOURNEYS" locked />
              <NavItem to="/journal" label="DREAM LAB" locked />
              <NavItem to="/guides" label="GUIDES" locked />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  locked = false,
  className = "",
}: {
  to: string;
  label: string;
  locked?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = pathname === to || (to === "/journeys" && pathname.startsWith("/journeys"));
  const navigate = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (window.__ASTRAL_CAPACITOR_ROUTING__) {
      window.location.hash = to;
      return;
    }
    router.navigate({ to });
  }, [router, to]);

  return (
    <button
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        navigate();
      }}
      onClick={navigate}
      className={`min-h-12 min-w-0 flex-1 touch-manipulation whitespace-nowrap rounded-[22px] px-1 py-3 text-center font-mono text-[9px] font-semibold tracking-[0.06em] transition duration-200 sm:px-2 sm:tracking-[0.22em] ${
        locked
          ? active
            ? "text-white/55"
            : "text-white/35 hover:text-white/50"
          : active
            ? "bg-[#c0b0f0] text-[#080610] shadow-[0_8px_24px_rgba(192,176,240,0.32)]"
            : "text-[#8ab8f0] hover:bg-white/8 hover:text-[#d8ccff]"
      } ${className}`}
    >
      {label}
    </button>
  );
}
