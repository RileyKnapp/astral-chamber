import { useCallback } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[120] px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-1 rounded-[28px] border border-white/15 bg-[#070411]/85 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55),0_0_28px_rgba(192,176,240,0.12)] backdrop-blur-2xl">
        <NavItem to="/" label="CHAMBER" />
        <NavItem to="/journeys" label="JOURNEYS" />
        <NavItem to="/journal" label="DREAM LAB" />
        <NavItem to="/guides" label="GUIDES" />
      </div>
    </nav>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
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
      className={`min-h-12 flex-1 touch-manipulation rounded-[22px] px-2 py-3 text-center font-mono text-[9px] font-semibold tracking-[0.22em] transition duration-200 ${
        active
          ? "bg-[#c0b0f0] text-[#080610] shadow-[0_8px_24px_rgba(192,176,240,0.32)]"
          : "text-[#8ab8f0] hover:bg-white/8 hover:text-[#d8ccff]"
      }`}
    >
      {label}
    </button>
  );
}
