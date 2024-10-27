// deno-lint-ignore-file
import { registerSW } from "virtual:pwa-register";

// Nodejs
//const isDev = process.env.NODE_ENV === "development";
//const pwaMode = isDev ? "development" : "production";

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl: any) {
    /*if (pwaMode == "development") {
      console.log("SW registered: ", swScriptUrl);
    }*/
  },
  onOfflineReady() {
    /*if (pwaMode == "development") {
      console.log("PWA application ready to work offline");
    }*/
  },
});
