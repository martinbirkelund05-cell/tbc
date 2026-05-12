"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function EditorialHeroPair() {
  const t = useTranslations("hero");
  const [isHoodies, setIsHoodies] = useState(false);
  const [displayed, setDisplayed] = useState(false);
  const [visible, setVisible] = useState(true);
  const splitRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const next = rect.top <= window.innerHeight / 2 - 80;
      setIsHoodies(next);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isHoodies === displayed) return;
    if (transitioning.current) return;
    transitioning.current = true;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayed(isHoodies);
      setVisible(true);
      transitioning.current = false;
    }, 220);
    return () => clearTimeout(t);
  }, [isHoodies, displayed]);

  return (
    <div
      className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-10"
      style={{ minHeight: "200vh", paddingTop: "25px" }}
    >
      {/* Tees background — top half */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "50%",
          backgroundImage: "url('/hero2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Hoodies background — bottom half */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "50%",
          backgroundImage: "url('/hero3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.25)" }} />

      {/* Boundary marker */}
      <div ref={splitRef} className="absolute inset-x-0" style={{ top: "50%" }} />

      {/* Sticky content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ position: "sticky", top: "calc(50vh - 80px)", paddingBottom: "25px" }}
      >
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
            {t("newItemsLiveNow")}
          </p>
          <h2
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{
              color: "#ffffff",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            {displayed ? t("hoodies") : t("tees")}
          </h2>
          <Link
            href={displayed ? "/collections/hoodies" : "/collections/tees"}
            className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase border px-5 py-2 transition-all hover:opacity-70"
            style={{ borderColor: "#ffffff", color: "#ffffff", borderRadius: "9999px" }}
          >
            {t("shopNow")}
          </Link>
      </div>
    </div>
  );
}
