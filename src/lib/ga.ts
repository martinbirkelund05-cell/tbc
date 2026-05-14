import { sendGAEvent } from "@next/third-parties/google";

function analyticsConsented(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("cookieConsent");
    if (!raw) return false;
    return JSON.parse(raw)?.analytics === true;
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackEvent(name: string, params?: Record<string, any>) {
  if (!analyticsConsented()) return;
  sendGAEvent("event", name, params ?? {});
}
