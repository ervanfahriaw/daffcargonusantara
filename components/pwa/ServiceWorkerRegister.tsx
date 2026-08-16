"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "DCN OpsHub Service Worker registered with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.warn("Service Worker registration notice:", error);
          });
      });
    }
  }, []);

  return null;
}
