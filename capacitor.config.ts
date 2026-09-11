import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.ilia.vpn",
  appName: "ILIA",
  webDir: "dist",
  backgroundColor: "#05080d",
  android: {
    allowMixedContent: false,
    backgroundColor: "#05080d",
  },
};

export default config;
