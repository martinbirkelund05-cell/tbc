"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Search, Package, ExternalLink } from "lucide-react";

interface Carrier {
  name: string;
  url: string;
  logo?: string;
}

function detectCarrier(raw: string): Carrier | null {
  const n = raw.trim().toUpperCase().replace(/\s+/g, "");

  // UPS — starts with 1Z, 18 chars
  if (/^1Z[A-Z0-9]{16}$/.test(n))
    return { name: "UPS", url: `https://www.ups.com/track?tracknum=${n}` };

  // FedEx — 12, 15, or 20 digits
  if (/^\d{12}$/.test(n) || /^\d{15}$/.test(n) || /^\d{20}$/.test(n))
    return { name: "FedEx", url: `https://www.fedex.com/fedextrack/?trknbr=${n}` };

  // USPS — 20–22 digits or 9400/9205/9270 prefix
  if (/^\d{20,22}$/.test(n) || /^(9400|9205|9270|9300|9361)\d+$/.test(n))
    return { name: "USPS", url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` };

  // DHL Express — JD prefix or exactly 10 digits
  if (/^JD\d{18}$/.test(n) || /^[0-9]{10}$/.test(n))
    return { name: "DHL Express", url: `https://www.dhl.com/en/express/tracking.html?AWB=${n}` };

  // DHL eCommerce — GM, LX, RX or similar
  if (/^GM\d+$/.test(n))
    return { name: "DHL eCommerce", url: `https://ecommerceportal.dhl.com/track/?ref=${n}` };

  // PostNord / Royal Mail / international post — letter-digit-letter pattern
  if (/^[A-Z]{2}\d{8,9}[A-Z]{2}$/.test(n))
    return { name: "PostNord", url: `https://tracking.postnord.com/tracking/#/search?id=${n}` };

  // GLS — 8–14 digits starting with specific ranges
  if (/^\d{8,14}$/.test(n))
    return { name: "GLS", url: `https://gls-group.com/track/${n}` };

  return null;
}

export default function TrackingPage() {
  const t = useTranslations('support.tracking');
  const [input, setInput]     = useState("");
  const [carrier, setCarrier] = useState<Carrier | null | "unknown">(null);
  const [submitted, setSubmitted] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const num = input.trim();
    if (!num) return;
    setSubmitted(num);
    const found = detectCarrier(num);
    setCarrier(found ?? "unknown");
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <p
        className="text-[11px] tracking-[0.2em] uppercase mb-3"
        style={{ color: "var(--text-muted)", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
      >
        {t('subtitle')}
      </p>
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--brand)", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
      >
        {t('title')}
      </h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
        {t('description')}
      </p>

      {/* Form */}
      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 text-[13px] px-4 py-3 outline-none"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text)",
            backgroundColor: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold tracking-widest uppercase transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "var(--brand)", color: "#fff" }}
        >
          <Search size={14} />
          {t('track')}
        </button>
      </form>

      {/* Result */}
      {carrier && submitted && (
        <div
          className="p-6"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          {/* Tracking number */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Package size={18} color="#fff" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
                Tracking number
              </p>
              <p className="text-[15px] font-bold" style={{ color: "var(--brand)" }}>
                {submitted}
              </p>
            </div>
          </div>

          {/* Carrier detected */}
          {carrier !== "unknown" && (
            <>
              <p className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
                Carrier detected: <span className="font-semibold" style={{ color: "var(--text)" }}>{carrier.name}</span>
              </p>
              <a
                href={carrier.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-[12px] font-bold tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{ backgroundColor: "var(--brand)", color: "#fff" }}
              >
                Track on {carrier.name}
                <ExternalLink size={13} />
              </a>
            </>
          )}

          {/* Carrier not detected — fallback to AfterShip */}
          {carrier === "unknown" && (
            <>
              <p className="text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
                Could not detect carrier automatically.
              </p>
              <a
                href={`https://track.aftership.com/${encodeURIComponent(submitted)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 text-[12px] font-bold tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{ backgroundColor: "var(--brand)", color: "#fff" }}
              >
                Track your order
                <ExternalLink size={13} />
              </a>
            </>
          )}

          <p className="text-[11px] text-center mt-4" style={{ color: "var(--text-muted)" }}>
            Need help?{" "}
            <Link href="/support/contact" style={{ color: "var(--brand)", textDecoration: "underline" }}>
              Contact us
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
