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
