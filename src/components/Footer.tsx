"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { ShopifyPolicies } from "@/lib/queries";

const DARK = "var(--brand)";

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const switchLocale = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    // Strip any existing locale prefix, then prepend new one
    const stripped = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
    const rest = stripped === '/' ? '' : stripped;
    router.push(`/${code}${rest}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70"
        style={{ color: "#666" }}
      >
        <span>{current.label}</span>
        <span style={{ fontSize: "10px", opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute bottom-full right-0 mb-2 z-20 bg-white shadow-lg"
            style={{ border: "1px solid var(--border)", minWidth: "140px" }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-left transition-opacity hover:opacity-70"
                style={{
                  color: lang.code === locale ? DARK : "#666",
                  fontWeight: lang.code === locale ? 600 : 400,
                }}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Footer({ policies }: { policies: ShopifyPolicies }) {
  const t = useTranslations('footer');
  const tn = useTranslations('newsletter');
  const locale = useLocale();

  const policyLinks = [
    policies.privacyPolicy,
    policies.termsOfService,
    policies.refundPolicy,
    policies.shippingPolicy,
  ]
    .filter(Boolean)
    .map((p) => ({ label: p!.title, href: `/policies/${p!.handle}` }));

  const STATIC_SECTIONS = [
    {
      label: t('brand').toUpperCase(),
      links: [
        { label: t('aboutUs'), href: "/about" },
      ],
    },
    {
      label: t('support').toUpperCase(),
      links: [
        { label: t('returnsExchange'), href: "/support/returns" },
        { label: t('orderTracking'), href: "/support/tracking" },
        { label: t('faq'), href: "/support/faq" },
        { label: t('contact'), href: "/support/contact" },
      ],
    },
  ];

  const SECTIONS = [
    ...STATIC_SECTIONS,
    { label: "POLICIES", links: policyLinks },
  ];

  const privacyHref = policies.privacyPolicy
    ? `/policies/${policies.privacyPolicy.handle}`
    : "/privacy";
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  type SubscribeState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; code: string; expiresAt: string }
    | { status: "already_subscribed" }
    | { status: "error" };

  const [subState, setSubState] = useState<SubscribeState>({ status: "idle" });
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(900);

  useEffect(() => {
    if (subState.status !== "success") return;
    const end = new Date(subState.expiresAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [subState]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubscribe = async () => {
    setEmailError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(tn('error'));
      return;
    }
    if (!agreed) return;
    setSubState({ status: "loading" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubState({ status: "success", code: data.code, expiresAt: data.expiresAt });
      } else if (data.error === "already_subscribed") {
        setSubState({ status: "already_subscribed" });
      } else {
        setSubState({ status: "error" });
      }
    } catch {
      setSubState({ status: "error" });
    }
  };

  const handleCopy = () => {
    if (subState.status !== "success") return;
    navigator.clipboard.writeText(subState.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (label: string) =>
    setOpenSection((prev) => (prev === label ? null : label));

  return (
    <footer style={{ backgroundColor: "#fff", borderTop: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section 1 — Newsletter */}
        <div className="py-10">
          <p
            className="text-[11px] tracking-[0.18em] font-semibold mb-1"
            style={{ color: DARK }}
          >
            {tn('title')}
          </p>
          <p className="text-[13px] mb-5" style={{ color: "#888" }}>
            {tn('subtitle')}
          </p>

          {subState.status === "success" ? (
            <div>
              <p className="text-[13px] mb-4" style={{ color: DARK }}>
                {tn('success')}
              </p>
              <div
                className="flex items-center justify-between gap-3 mb-3 px-4 py-3"
                style={{ border: `2px dashed ${DARK}`, backgroundColor: "#f5efe6" }}
              >
                <span className="text-[17px] font-bold tracking-widest" style={{ color: DARK }}>
                  {subState.code}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-[11px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap transition-opacity hover:opacity-60"
                  style={{ color: DARK }}
                >
                  {copied ? tn('copied') : tn('copy')}
                </button>
              </div>
              {secondsLeft > 0 ? (
                <p className="text-[12px]" style={{ color: "#888" }}>
                  {tn('expires')}{" "}
                  <span className="font-bold tabular-nums" style={{ color: "#1E2B15" }}>
                    {fmt(secondsLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-[12px]" style={{ color: "#aaa" }}>{tn('expires')} 00:00</p>
              )}
            </div>
          ) : subState.status === "already_subscribed" ? (
            <p className="text-[13px]" style={{ color: "#888" }}>
              {tn('alreadySubscribed')}
            </p>
          ) : (
            <>
              <div className="flex items-end gap-3 mb-1" style={{ borderBottom: `1px solid var(--border)` }}>
                <input
                  type="email"
                  placeholder={tn('placeholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  className="flex-1 bg-transparent outline-none text-[13px] pb-2"
                  style={{ color: DARK }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  disabled={subState.status === "loading"}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={subState.status === "loading" || !agreed}
                  className="pb-2 text-[11px] font-semibold tracking-[0.15em] whitespace-nowrap transition-opacity hover:opacity-60 disabled:opacity-40"
                  style={{ color: DARK }}
                >
                  {subState.status === "loading" ? "..." : tn('subscribe')}
                </button>
              </div>

              {emailError && (
                <p className="text-[11px] mb-2" style={{ color: "#c0392b" }}>{emailError}</p>
              )}
              {subState.status === "error" && (
                <p className="text-[11px] mb-2" style={{ color: "#c0392b" }}>{tn('error')}</p>
              )}

              <label className="flex items-start gap-2 cursor-pointer select-none mt-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: DARK }}
                />
                <span className="text-[11px] leading-relaxed" style={{ color: "#888" }}>
                  {tn('checkbox')}{" "}
                  <Link href={privacyHref} className="underline" style={{ color: DARK }}>
                    {t('privacyPolicy')}
                  </Link>
                </span>
              </label>
            </>
          )}
        </div>

        {/* Separator */}
        <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Section 2 — Accordion nav */}
        <div>
          {SECTIONS.map(({ label, links }) => {
            const isOpen = openSection === label;
            return (
              <div key={label}>
                <button
                  onClick={() => toggle(label)}
                  className="flex items-center justify-between w-full py-4 text-left"
                >
                  <span className="text-[11px] tracking-[0.15em] font-semibold" style={{ color: DARK }}>
                    {label}
                  </span>
                  <span className="text-[18px] leading-none" style={{ color: DARK }}>
                    {isOpen ? "×" : "+"}
                  </span>
                </button>

                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: isOpen ? `${links.length * 40}px` : "0",
                    transition: "max-height 0.28s ease",
                  }}
                >
                  <div className="pb-4 flex flex-col gap-3">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-[13px] transition-opacity hover:opacity-60"
                        style={{ color: "#666" }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
              </div>
            );
          })}

          {/* Social — no accordion, icons inline */}
          <div>
            <div className="flex items-center justify-between w-full py-4">
              <span className="text-[11px] tracking-[0.15em] font-semibold" style={{ color: DARK }}>
                SOCIAL
              </span>
              <div className="flex items-center gap-4">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/thebrandcrate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="transition-opacity hover:opacity-60"
                  style={{ color: DARK }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@thebrandcrate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="transition-opacity hover:opacity-60"
                  style={{ color: DARK }}
                >
                  <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V7a4.85 4.85 0 0 1-1.01-.31z" />
                  </svg>
                </a>
              </div>
            </div>
            <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
          </div>
        </div>

        {/* Section 3 — Country & Language */}
        <div className="flex items-center justify-between py-5">
          <span className="text-[11px] tracking-[0.12em] font-semibold" style={{ color: DARK }}>
            {t('countryLanguage').toUpperCase()}
          </span>
          <LanguageSelector />
        </div>

        {/* Separator */}
        <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Section 4 — Brand name */}
        <div className="py-6 overflow-hidden">
          <p
            className="text-center leading-none select-none"
            style={{
              fontWeight: 700,
              fontSize: "clamp(28px, 10vw, 88px)",
              color: DARK,
              letterSpacing: "-0.01em",
            }}
          >
            THEBRANDCRATE
          </p>
        </div>

      </div>
    </footer>
  );
}
