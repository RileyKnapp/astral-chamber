import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "../components/BottomNav";
import { AppStateProvider, useAppState } from "../lib/app-state";
import { Onboarding } from "../components/Onboarding";
import { SettingsButton } from "../components/SettingsButton";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-5xl font-extralight tracking-widest text-white/90">⌬</h1>
        <p className="mt-4 text-sm text-white/50">This threshold doesn't exist.</p>
        <a href="/" className="mt-6 inline-block text-sm text-violet-300 underline">
          Return
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-lg font-light text-white/90">The signal faded.</h1>
        <p className="mt-2 text-sm text-white/50">Something went wrong.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-5 rounded-full bg-white px-5 py-2 text-sm text-black"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { name: "theme-color", content: "#05030c" },
      { title: "Threshold — Binaural Beats for Lucid Dreaming" },
      {
        name: "description",
        content:
          "A binaural beats sanctuary for lucid dreaming, astral projection, and deep meditation. Real frequencies. Real engine.",
      },
      { property: "og:title", content: "Threshold — Binaural Beats for Lucid Dreaming" },
      { name: "twitter:title", content: "Threshold — Binaural Beats for Lucid Dreaming" },
      {
        name: "description",
        content:
          "Threshold Dreams is a mobile-first web app for lucid dreaming and astral projection.",
      },
      {
        property: "og:description",
        content:
          "Threshold Dreams is a mobile-first web app for lucid dreaming and astral projection.",
      },
      {
        name: "twitter:description",
        content:
          "Threshold Dreams is a mobile-first web app for lucid dreaming and astral projection.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4188f73-d5a7-4cf9-9277-6ad2c153fc8c/id-preview-262e7cb3--063511ff-f03b-47f7-831e-60b161f1d1a1.lovable.app-1780590685620.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4188f73-d5a7-4cf9-9277-6ad2c153fc8c/id-preview-262e7cb3--063511ff-f03b-47f7-831e-60b161f1d1a1.lovable.app-1780590685620.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { account, onboarding } = useAppState();
  const hasAccess = onboarding.completed && account != null;
  return (
    <>
      <Outlet />
      {hasAccess && (
        <>
          <SettingsButton />
          <BottomNav />
        </>
      )}
      <Onboarding />
    </>
  );
}
