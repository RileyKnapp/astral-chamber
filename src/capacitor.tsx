import { RouterProvider, createHashHistory } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { getRouter } from "./router";
import "./styles.css";

declare global {
  interface Window {
    __ASTRAL_CAPACITOR_ROUTING__?: boolean;
  }
}

window.__ASTRAL_CAPACITOR_ROUTING__ = true;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<RouterProvider router={getRouter(createHashHistory())} />);

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const wait = (duration: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });

void Promise.all([waitForPaint(), wait(180)]).then(() => {
  const loader = document.getElementById("app-loader");
  document.body.setAttribute("data-app-ready", "true");
  if (!loader) return;

  loader.setAttribute("data-hiding", "true");
  window.setTimeout(() => loader.remove(), 360);
});
