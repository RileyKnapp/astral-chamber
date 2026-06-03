import { Link } from "@tanstack/react-router";
import { Moon, BookOpen } from "lucide-react";

const tabs = [
  { to: "/" as const, label: "Journeys", icon: Moon, exact: true },
  { to: "/journal" as const, label: "Journal", icon: BookOpen, exact: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-black/70 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <Link
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="group flex flex-col items-center gap-1 py-3 text-white/40 transition-colors data-[status=active]:text-white"
            >
              <t.icon size={20} />
              <span className="text-[10px] tracking-[0.2em] uppercase">
                {t.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
