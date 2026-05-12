"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const C = "#3D4A2D";

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("newsletterPopupSeen")) return;

    let countdown: ReturnType<typeof setTimeout> | null = null;

    const trySchedule = () => {
      if (localStorage.getItem("hasVisited")) {
        if (localStorage.getItem("newsletterPopupSeen")) return;
        countdown = setTimeout(() => setVisible(true), 5000);
      }
    };

    // If hasVisited is already set, schedule immediately
    trySchedule();

    // Poll until hasVisited is set (welcome modal not yet confirmed)
    const poll = setInterval(() => {
      if (localStorage.getItem("hasVisited")) {
        clearInterval(poll);
        trySchedule();
      }
    }, 500);

    return () => {
      clearInterval(poll);
      if (countdown) clearTimeout(countdown);
    };
  }, []);

  function close() {
    localStorage.setItem("newsletterPopupSeen", "true");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!agreed) {
      setError("Please accept the privacy policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const locale = localStorage.getItem("preferredLocale") ?? "en";
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, locale }),
      });
      setSuccess(true);
      localStorage.setItem("newsletterPopupSeen", "true");
      setTimeout(() => setVisible(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 520,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: "36px 32px 32px",
          position: "relative",
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* Close */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 20,
            background: "none", border: "none", cursor: "pointer",
            color: C, fontSize: 22, lineHeight: 1,
          }}
        >
          ×
        </button>

        {success ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C, marginBottom: 10 }}>
              Welcome to the family!
            </p>
            <p style={{ fontSize: 14, color: C, opacity: 0.75 }}>
              Check your inbox for your discount code.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Brand */}
            <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C, textAlign: "center", marginBottom: 16 }}>
              TheBrandCrate
            </p>

            {/* Headline */}
            <p style={{ fontSize: 32, fontWeight: 800, color: C, textAlign: "center", lineHeight: 1.1, marginBottom: 10 }}>
              Join the Movement
            </p>

            {/* Subline */}
            <p style={{ fontSize: 16, fontWeight: 700, color: C, textAlign: "center", marginBottom: 28 }}>
              Get 10% off on your first order
            </p>

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "14px 16px",
                border: `1.5px solid ${C}`, borderRadius: 10,
                fontSize: 14, color: C, outline: "none",
                marginBottom: 12, boxSizing: "border-box",
                fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
              }}
            />

            {/* Name */}
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                display: "block", width: "100%", padding: "14px 16px",
                border: `1.5px solid ${C}`, borderRadius: 10,
                fontSize: 14, color: C, outline: "none",
                marginBottom: 18, boxSizing: "border-box",
                fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
              }}
            />

            {/* Checkbox */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 24 }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 2, flexShrink: 0, width: 18, height: 18, accentColor: C, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: C, lineHeight: 1.6 }}>
                I agree to receive content from TheBrandCrate via email and have read and accept the{" "}
                <Link href="/policies/privacy-policy" style={{ color: C, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  Privacy Policy
                </Link>.
              </span>
            </label>

            {error && (
              <p style={{ fontSize: 12, color: "#c0392b", marginBottom: 12, textAlign: "center" }}>{error}</p>
            )}

            {/* Submit */}
            <div style={{ textAlign: "center" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 48px",
                  border: `1.5px solid ${C}`,
                  borderRadius: 99,
                  backgroundColor: "#fff",
                  color: C,
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "..." : "Join Now"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
