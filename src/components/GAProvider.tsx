"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

function isAnalyticsConsented(): boolean {
  try {
    const raw = localStorage.getItem("cookieConsent");
    if (!raw) return false;
    return JSON.parse(raw)?.analytics === true;
  } catch {
    return false;
  }
}

export function GAProvider({ gaId }: { gaId: string }) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Check on mount
    setConsented(isAnalyticsConsented());

    // Re-check when CookieBanner saves consent (same tab custom event)
    const onConsent = () => setConsented(isAnalyticsConsented());
    window.addEventListener("cookieConsentUpdated", onConsent);

    // Re-check when storage changes in another tab
    window.addEventListener("storage", onConsent);

    return () => {
      window.removeEventListener("cookieConsentUpdated", onConsent);
      window.removeEventListener("storage", onConsent);
    };
  }, []);

  if (!consented || !gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
