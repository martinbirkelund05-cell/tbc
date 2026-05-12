"use client";

import { useState } from "react";

const COLOR = "#3D4A2D";
const BORDER = "#d8d8d0";

type State = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!message.trim()) e.message = "Please enter a message.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "13px",
    fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
    color: COLOR,
    backgroundColor: "#ffffff",
    border: `1px solid ${BORDER}`,
    outline: "none",
    boxSizing: "border-box",
  };

  if (state === "success") {
    return (
      <main style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "64px 24px 120px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "28px", fontWeight: 700, color: COLOR, marginBottom: "32px", letterSpacing: "-0.01em" }}>
            Contact
          </h1>
          <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "14px", lineHeight: 1.8, color: COLOR }}>
            Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "64px 24px 120px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "28px", fontWeight: 700, color: COLOR, marginBottom: "12px", letterSpacing: "-0.01em" }}>
          Contact
        </h1>
        <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "13px", lineHeight: 1.8, color: COLOR, opacity: 0.7, marginBottom: "8px" }}>
          Have a question or need help? Reach out and we&apos;ll get back to you within 24 hours.
        </p>
        <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "13px", lineHeight: 1.8, color: COLOR, opacity: 0.7, marginBottom: "40px" }}>
          For PR or press inquiries, contact us at{" "}
          <a href="mailto:thebrandcrate@gmail.com" style={{ color: COLOR, textDecoration: "underline" }}>
            thebrandcrate@gmail.com
          </a>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Your name *"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              style={{ ...inputStyle, borderColor: errors.name ? "#c0392b" : BORDER }}
            />
            {errors.name && <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "11px", color: "#c0392b", marginTop: "4px" }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Your email *"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              style={{ ...inputStyle, borderColor: errors.email ? "#c0392b" : BORDER }}
            />
            {errors.email && <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "11px", color: "#c0392b", marginTop: "4px" }}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <input
            type="tel"
            placeholder="Your phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          {/* Message */}
          <div>
            <textarea
              placeholder={"Your message *\n\nIf your enquiry relates to an order, please include your order number #XXXX."}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: undefined })); }}
              rows={8}
              style={{ ...inputStyle, resize: "vertical", borderColor: errors.message ? "#c0392b" : BORDER }}
            />
            {errors.message && <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "11px", color: "#c0392b", marginTop: "4px" }}>{errors.message}</p>}
          </div>

          {state === "error" && (
            <p style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "12px", color: "#c0392b" }}>
              Something went wrong. Please try again or email us directly at thebrandcrate@gmail.com.
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={state === "loading"}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: COLOR,
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
              border: "none",
              cursor: state === "loading" ? "default" : "pointer",
              opacity: state === "loading" ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {state === "loading" ? "Sending..." : "Send message"}
          </button>
        </div>
      </div>
    </main>
  );
}
