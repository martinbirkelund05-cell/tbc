"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BG = "#3D4A2D";
const ROW_BG = "rgba(255,255,255,0.10)";
const ROW_BORDER = "rgba(255,255,255,0.13)";

const COOKIE_TYPES = [
  {
    key: "necessary",
    label: "Necessary",
    desc: "Required for the website to function. Cannot be disabled.",
    always: true,
  },
  {
    key: "preferences",
    label: "Preferences",
    desc: "Allows the website to remember your preferences such as language and region.",
    always: false,
  },
  {
    key: "marketing",
    label: "Marketing",
    desc: "Used to track visitors and show relevant ads.",
    always: false,
  },
  {
    key: "analytics",
    label: "Analytics",
    desc: "Helps us understand how visitors interact with our website.",
    always: false,
  },
];

interface Prefs { necessary: boolean; preferences: boolean; marketing: boolean; analytics: boolean }

function Toggle({ on, disabled, onToggle }: { on: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={on}
      style={{
        flexShrink: 0, width: 34, height: 20, borderRadius: 10,
        backgroundColor: on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)",
        border: "none", cursor: disabled ? "default" : "pointer",
        position: "relative", transition: "background-color 0.2s",
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: on ? 15 : 3,
        width: 14, height: 14, borderRadius: "50%",
        backgroundColor: on ? BG : "rgba(255,255,255,0.55)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function PrefsModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (prefs: Prefs, all: boolean) => void;
}) {
  const [prefs, setPrefs] = useState<Prefs>({ necessary: true, preferences: false, marketing: false, analytics: false });
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 400,
          backgroundColor: BG,
          borderRadius: 14,
          padding: "20px 18px 0",
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* X button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 20, lineHeight: 1 }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <p style={{ fontSize: 15, fontWeight: 400, color: "#fff", textAlign: "center", marginBottom: 10 }}>
          This website uses cookies
        </p>

        {/* Body */}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.65, marginBottom: 16 }}>
          This website uses cookies to analyze our traffic, personalize content and/or ads. We also share information about your use of our site with our analytics and advertising partners.
        </p>

        {/* Toggle rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 0 }}>
          {COOKIE_TYPES.map(({ key, label, desc, always }) => {
            const isOn = always || prefs[key as keyof Prefs];
            const isExpanded = expanded === key;
            return (
              <div
                key={key}
                style={{
                  backgroundColor: ROW_BG,
                  border: `1px solid ${ROW_BORDER}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div className="flex items-center gap-2" style={{ padding: "9px 12px" }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", color: "#fff",
                      fontSize: 13, fontWeight: 400, padding: 0,
                      display: "flex", alignItems: "center", gap: 6, flex: 1, textAlign: "left",
                    }}
                  >
                    <span style={{
                      display: "inline-block", fontSize: 11,
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}>›</span>
                    <span style={{ fontSize: 12 }}>{label}</span>
                  </button>
                  <Toggle on={isOn} disabled={always} onToggle={() => !always && toggle(key as keyof Prefs)} />
                </div>
                {isExpanded && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", padding: "0 12px 10px 30px", lineHeight: 1.55 }}>
                    {desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: `1px solid ${ROW_BORDER}`, marginTop: 14 }}>
          <button
            onClick={() => onSave(prefs, false)}
            style={{
              width: "100%", padding: "12px", background: "none", border: "none",
              borderBottom: `1px solid ${ROW_BORDER}`,
              color: "#fff", fontSize: 12, fontWeight: 400, cursor: "pointer",
              fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Allow selection
          </button>
          <button
            onClick={() => onSave({ necessary: true, preferences: true, marketing: true, analytics: true }, true)}
            style={{
              width: "100%", padding: "12px", background: "none", border: "none",
              color: "#fff", fontSize: 12, fontWeight: 400, cursor: "pointer",
              fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Allow all cookies
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cookieConsent")) return;
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setSliding(true), 20);
    return () => clearTimeout(t);
  }, [visible]);

  function dismiss() {
    setPrefsOpen(false);
    setSliding(false);
    setTimeout(() => setVisible(false), 400);
  }

  function acceptAll() {
    localStorage.setItem("cookieConsent", JSON.stringify({ necessary: true, preferences: true, marketing: true, analytics: true }));
    document.cookie = "consent=accepted; max-age=31536000; path=/";
    dismiss();
  }

  function savePrefs(prefs: Prefs) {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    document.cookie = "consent=custom; max-age=31536000; path=/";
    dismiss();
  }

  if (!visible) return null;

  return (
    <>
      {prefsOpen && (
        <PrefsModal
          onClose={() => setPrefsOpen(false)}
          onSave={(prefs) => savePrefs(prefs)}
        />
      )}

      {/* Banner — hidden when prefs modal is open */}
      {!prefsOpen && (
        <div
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            zIndex: 299,
            backgroundColor: BG,
            transform: sliding ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.4s ease",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          <div className="flex flex-col items-center text-center px-6 py-10 gap-6">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 10px" }}>
                This website uses cookies to ensure you get the best experience on our website.
              </p>
              <Link
                href="/policies/privacy-policy"
                style={{ fontSize: 12, color: "#fff", textDecoration: "underline", textUnderlineOffset: "3px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}
              >
                Privacy Policy
              </Link>
            </div>

            <div className="flex flex-col items-center gap-4 w-full" style={{ maxWidth: 320 }}>
              <button
                onClick={acceptAll}
                style={{
                  width: "100%", padding: "13px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Accept all cookies
              </button>
              <button
                onClick={() => setPrefsOpen(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
                  color: "#fff", textDecoration: "underline", textUnderlineOffset: "3px",
                }}
              >
                Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
