"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Search } from "lucide-react";

export default function TrackingPage() {
  const t = useTranslations('support.tracking');
  const [input, setInput]       = useState("");
  const [submitted, setSubmitted] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const num = input.trim();
    if (!num) return;
    setSubmitted(num);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
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
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            backgroundColor: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold tracking-widest uppercase transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: "var(--brand)",
            color: "#fff",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          <Search size={14} />
          {t('track')}
        </button>
      </form>

      {/* AfterShip embedded tracking */}
      {submitted && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 2, overflow: "hidden" }}>
          <iframe
            key={submitted}
            src={`https://track.aftership.com/${encodeURIComponent(submitted)}`}
            width="100%"
            height="600"
            style={{ border: "none", display: "block" }}
            title="Order tracking"
          />
        </div>
      )}
    </div>
  );
}
