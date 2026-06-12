import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.astralchamber.app",
  appName: "Astral Chamber",
  // Dedicated static bundle for Capacitor, built with `bun run build:ios:web`.
  webDir: "dist/capacitor",
  ios: {
    // The web UI handles the iPhone safe areas with env(safe-area-inset-*).
    // Adding a native inset here would apply the top/bottom spacing twice.
    contentInset: "never",
    backgroundColor: "#05030c",
    // Helpful while testing on a real device against the dev server:
    // server: { url: "http://YOUR_MAC_LAN_IP:3000", cleartext: true },
  },
  backgroundColor: "#05030c",
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: true,
      iosKeychainPrefix: "astral-chamber",
    },
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
