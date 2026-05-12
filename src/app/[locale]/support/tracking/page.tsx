"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
} from "lucide-react";

type Checkpoint = {
  checkpoint_time: string;
  message: string;
  tag?: string;
  subtag?: string;
  city?: string;
  state?: string;
  country_name?: string;
};

type TrackingData = {
  tracking_number: string;
  slug?: string;
  tag?: string;
  checkpoints?: Checkpoint[];
};

function getStatusMeta(tag?: string): {
  Icon: React.ElementType;
  color: string;
  dotColor: string;
} {
  switch (tag) {
    case "Delivered":
      return { Icon: CheckCircle2, color: "#2D6A27", dotColor: "#2D6A27" };
    case "OutForDelivery":
      return { Icon: MapPin, color: "var(--brand)", dotColor: "var(--brand)" };
    case "InTransit":
      return { Icon: Truck, color: "var(--text)", dotColor: "var(--brand)" };
    case "InfoReceived":
      return { Icon: Package, color: "var(--text)", dotColor: "var(--brand)" };
    case "Exception":
    case "AttemptFail":
    case "Expired":
      return { Icon: AlertTriangle, color: "#D97706", dotColor: "#D97706" };
    default:
      return { Icon: Clock, color: "var(--text-muted)", dotColor: "#9CA3AF" };
  }
}

function formatDateTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLocation(cp: Checkpoint) {
  return [cp.city, cp.state, cp.country_name].filter(Boolean).join(", ");
}

export default function TrackingPage() {
  const t = useTranslations('support.tracking');
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState<"not_found" | "error" | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setTracking(null);
    setError(null);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: input.trim() }),
      });
      if (res.status === 404) {
        setError("not_found");
      } else if (!res.ok) {
        setError("error");
      } else {
        const data = await res.json();
        setTracking(data.tracking);
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  const checkpoints = tracking?.checkpoints
    ? [...tracking.checkpoints].reverse()
    : [];

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
      <form onSubmit={handleTrack} className="flex gap-2 mb-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 text-[13px] px-4 py-3 outline-none"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            backgroundColor: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold tracking-widest uppercase transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: "var(--brand)",
            color: "#fff",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {loading ? (
            <span className="text-sm">…</span>
          ) : (
            <>
              <Search size={14} />
              {t('track')}
            </>
          )}
        </button>
      </form>

      {/* Not found */}
      {error === "not_found" && (
        <div
          className="text-[13px] px-5 py-4 mb-8"
          style={{ backgroundColor: "#FFF8F0", border: "1px solid #F5DFC8", lineHeight: 1.7 }}
        >
          <p className="font-bold mb-1" style={{ color: "var(--brand)" }}>
            {t('notFound')}
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            {t('notFoundDesc')}{" "}
            <Link href="/support/contact" style={{ color: "var(--brand)", textDecoration: "underline" }}>
              {t('contactUs')}
            </Link>{" "}
            if you need help.
          </p>
        </div>
      )}

      {/* Generic error */}
      {error === "error" && (
        <p className="text-[13px] mb-8" style={{ color: "#D97706" }}>
          Something went wrong. Please try again or{" "}
          <Link href="/support/contact" style={{ color: "var(--brand)", textDecoration: "underline" }}>
            {t('contactUs')}
          </Link>.
        </p>
      )}

      {/* Results */}
      {tracking && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
                Tracking number
              </p>
              <p className="text-[14px] font-bold" style={{ color: "var(--brand)" }}>
                {tracking.tracking_number}
              </p>
            </div>
            {tracking.tag && (
              <span
                className="text-[11px] font-bold tracking-wide uppercase px-3 py-1.5"
                style={{
                  backgroundColor:
                    tracking.tag === "Delivered"
                      ? "#E8F5E5"
                      : tracking.tag === "Exception" || tracking.tag === "AttemptFail" || tracking.tag === "Expired"
                      ? "#FEF3C7"
                      : "var(--bg-card)",
                  color:
                    tracking.tag === "Delivered"
                      ? "#2D6A27"
                      : tracking.tag === "Exception" || tracking.tag === "AttemptFail" || tracking.tag === "Expired"
                      ? "#D97706"
                      : "var(--brand)",
                }}
              >
                {tracking.tag === "Delivered"
                  ? "Delivered"
                  : tracking.tag === "InTransit"
                  ? "In Transit"
                  : tracking.tag === "OutForDelivery"
                  ? "Out for Delivery"
                  : tracking.tag === "InfoReceived"
                  ? "Info Received"
                  : tracking.tag === "AttemptFail"
                  ? "Delivery Attempted"
                  : tracking.tag === "Exception"
                  ? "Exception"
                  : tracking.tag === "Expired"
                  ? "Expired"
                  : tracking.tag}
              </span>
            )}
          </div>

          {/* Timeline */}
          {checkpoints.length === 0 ? (
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              {t('noEvents')}
            </p>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-[15px] top-2 bottom-2"
                style={{ width: "1px", backgroundColor: "var(--border)" }}
              />

              <div className="flex flex-col gap-0">
                {checkpoints.map((cp, i) => {
                  const { Icon, color, dotColor } = getStatusMeta(cp.tag);
                  const location = formatLocation(cp);
                  const isFirst = i === 0;

                  return (
                    <div key={i} className="flex gap-4 pb-7 last:pb-0">
                      {/* Icon/dot */}
                      <div className="flex-shrink-0 relative z-10" style={{ width: "32px" }}>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: isFirst ? dotColor : "#fff",
                            border: `1.5px solid ${dotColor}`,
                          }}
                        >
                          <Icon
                            size={14}
                            style={{ color: isFirst ? "#fff" : dotColor }}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-1 min-w-0">
                        <p
                          className="text-[13px] font-bold leading-snug mb-0.5"
                          style={{ color: isFirst ? color : "var(--text)" }}
                        >
                          {cp.message || cp.tag}
                        </p>
                        {location && (
                          <p className="text-[11px] mb-0.5" style={{ color: "var(--text-muted)" }}>
                            {location}
                          </p>
                        )}
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {formatDateTime(cp.checkpoint_time)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
