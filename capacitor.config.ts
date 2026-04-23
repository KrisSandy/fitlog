import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitlog.app",
  appName: "FitLog",
  webDir: "out",           // Next.js static export folder
  server: {
    androidScheme: "https",
  },
};

export default config;
