import { Link } from "@tanstack/react-router";

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c0b0f0]/20 bg-[#02050d]/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        <NavItem to="/" label="CHAMBER" />
        <NavItem to="/journeys" label="JOURNEYS" />
        <NavItem to="/journal" label="DREAM LAB" />
        <NavItem to="/guides" label="GUIDES" />
      </div>
    </nav>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ style: { color: "#c0b0f0" } }}
      inactiveProps={{ style: { color: "#7fa9c8" } }}
      className="flex-1 py-4 text-center font-mono text-[10px] tracking-[0.25em] transition-colors"
    >
      {label}
    </Link>
  );
}
