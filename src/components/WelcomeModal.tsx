"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { COUNTRY_CURRENCY, formatShippingThreshold } from "@/lib/shipping";

const SUPPORTED_LOCALES = ["en", "de", "fr", "da", "nl"];

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

const COUNTRY_LANG: Record<string, string> = {
  DE: "de", AT: "de",
  FR: "fr", CH: "fr",
  DK: "da",
  NL: "nl", BE: "nl",
};

const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "CA", name: "Canada" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IS", name: "Iceland" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LU", name: "Luxembourg" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

function getLangForCountry(code: string) {
  return COUNTRY_LANG[code] ?? "en";
}

function getCountryName(code: string) {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export function WelcomeModal({ currentLocale }: { currentLocale: string }) {
  const [visible, setVisible] = useState(false);
  const [countryCode, setCountryCode] = useState("GB");
  const [selectedCountry, setSelectedCountry] = useState("GB");
  const [selectedLang, setSelectedLang] = useState("en");
  const [logoFontSize, setLogoFontSize] = useState(26);
  const logoRef = useRef<HTMLParagraphElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("hasVisited")) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          const cc: string = data.country_code ?? "GB";
          // Only use detected country if it's in our list
          const supported = COUNTRIES.some((c) => c.code === cc);
          const finalCC = supported ? cc : "GB";
          setCountryCode(finalCC);
          setSelectedCountry(finalCC);
          setSelectedLang(getLangForCountry(finalCC));
        }
      } catch {
        // fallback to GB
      }
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setSelectedLang(getLangForCountry(code));
  };

  const handleConfirm = useCallback(() => {
    localStorage.setItem("hasVisited", "true");
    localStorage.setItem("preferredLocale", selectedLang);
    localStorage.setItem("preferredCountry", selectedCountry);
    document.cookie = `NEXT_LOCALE=${selectedLang}; path=/; max-age=31536000`;
    document.cookie = `NEXT_COUNTRY=${selectedCountry}; path=/; max-age=31536000`;

    setVisible(false);

    if (selectedLang !== currentLocale) {
      const parts = pathname.split("/");
      if (parts[1] && SUPPORTED_LOCALES.includes(parts[1])) {
        parts[1] = selectedLang;
      } else {
        parts.splice(1, 0, selectedLang);
      }
      router.push(parts.join("/") || "/");
    }
  }, [selectedLang, selectedCountry, currentLocale, pathname, router]);

  // Resize logo to match question width
  useEffect(() => {
    if (!logoRef.current || !questionRef.current) return;
    const qWidth = questionRef.current.offsetWidth;
    const lWidth = logoRef.current.scrollWidth;
    const current = parseFloat(getComputedStyle(logoRef.current).fontSize);
    setLogoFontSize((current * qWidth) / lWidth);
  }, [visible, selectedCountry]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [visible]);

  const tm = useTranslations("modal");

  const shippingThreshold = formatShippingThreshold(selectedCountry);

  if (!visible) return null;

  const bullets = [
    tm("freeShipping", { amount: shippingThreshold }),
    tm("deliveryDays"),
    tm("returns"),
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="w-full max-w-md bg-white"
        style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
      >
        {/* Logo */}
        <div className="pt-10 pb-6 px-8 text-center">
          <p
            ref={logoRef}
            className="font-bold tracking-tight mb-6 whitespace-nowrap"
            style={{ fontSize: `${logoFontSize}px`, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", color: "var(--brand)" }}
          >
            TheBrandCrate
          </p>

          <p ref={questionRef} className="text-[15px] font-bold mb-5 whitespace-nowrap" style={{ color: "var(--brand)" }}>
            {tm("shoppingIn", { country: getCountryName(selectedCountry) })}
          </p>

          <ul className="text-left text-[13px] space-y-2.5 mb-7" style={{ color: "var(--text-muted)" }}>
            {bullets.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--brand)" }}>•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Dropdowns */}
        <div className="px-8 py-5 grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
              {tm("shippingTo")}
            </p>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full text-[13px] pr-6 py-1 appearance-none cursor-pointer outline-none bg-transparent"
                style={{ color: "var(--brand)", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", borderBottom: "1px solid var(--border)" }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: "var(--brand)" }}>▾</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
              {tm("language")}
            </p>
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full text-[13px] pr-6 py-1 appearance-none cursor-pointer outline-none bg-transparent"
                style={{ color: "var(--brand)", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", borderBottom: "1px solid var(--border)" }}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: "var(--brand)" }}>▾</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-4 text-[12px] font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-85"
          style={{ backgroundColor: "var(--brand)", color: "#ffffff" }}
        >
          {tm("confirm")}
        </button>
      </div>
    </div>
  );
}
