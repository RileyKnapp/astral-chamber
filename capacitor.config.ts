import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.astralchamber.app",
  appName: "Astral Chamber",
  // TanStack Start's client build emits to .output/public on most setups.
  // If your build output differs, point webDir at the folder containing index.html.
  webDir: ".output/public",
  ios: {
    contentInset: "always",
    backgroundColor: "#05030c",
    // Helpful while testing on a real device against the dev server:
    // server: { url: "http://YOUR_MAC_LAN_IP:3000", cleartext: true },
  },
  backgroundColor: "#05030c",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#05030c",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#05030c",
    },
  },
};

export default config;
