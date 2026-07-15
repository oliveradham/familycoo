import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.familycoo.ios",
  appName: "Family COO",
  webDir: "www",
  server: {
    url: "https://family-coo.com",
    cleartext: false,
    allowNavigation: ["family-coo.com", "www.family-coo.com"],
  },
  ios: {
    scheme: "FamilyCOO",
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#F7F5F0",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#F7F5F0",
    },
  },
};

export default config;
