import { Link } from "@tanstack/react-router";
import { Compass, Sliders, Moon, Settings as Cog } from "lucide-react";

const items = [
  { to: "/", label: "Journeys", Icon: Compass },
  { to: "/mixer", label: "Mixer", Icon: Sliders },
  { to: "/dream-lab", label: "Dream Lab", Icon: Moon },
  { to: "/settings", label: "Settings", Icon: Cog },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-black/60 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2 pb-2">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] tracking-wide text-white/45 transition-colors"
              activeProps={{ className: "text-white" }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={1.6}
                    className={isActive ? "drop-shadow-[0_0_8px_rgba(180,160,255,0.7)]" : ""}
                  />
                  <span className="uppercase">{label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
