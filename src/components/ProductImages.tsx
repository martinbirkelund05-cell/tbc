"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import type { ShopifyImage, ShopifyProductVariant } from "@/types/shopify";

interface Props {
  images: ShopifyImage[];
  title: string;
  variants: ShopifyProductVariant[];
}

export function ProductImages({ images, title, variants }: Props) {
  const [selected, setSelected] = useState(0);
  const stripRef   = useRef<HTMLDivElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const startX     = useRef(0);
  const startY     = useRef(0);
  const dragging   = useRef(false);
  const lockedAxis = useRef<"h" | "v" | null>(null);

  const hasColorVariants = variants.some((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === "color")
  );

  // Snap strip to a given index (with transition)
  const snapTo = (idx: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.style.transition = "transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)";
    strip.style.transform  = `translateX(-${idx * (100 / images.length)}%)`;
    setSelected(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    startX.current     = e.touches[0].clientX;
    startY.current     = e.touches[0].clientY;
    dragging.current   = false;
    lockedAxis.current = null;
    // Kill ongoing transition so finger grabs strip at its current position
    const strip = stripRef.current;
    if (strip) strip.style.transition = "none";
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine axis on first significant move
    if (!lockedAxis.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      lockedAxis.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
    }
    if (lockedAxis.current === "v") return; // let page scroll naturally

    e.preventDefault(); // block scroll while swiping horizontally
    dragging.current = true;

    const wrap  = wrapRef.current;
    const strip = stripRef.current;
    if (!wrap || !strip) return;

    const wrapW  = wrap.clientWidth;
    const baseX  = -(selected * wrapW);            // current resting position in px
    // Add rubber-band resistance at edges
    let next = baseX + dx;
    const minX = -((images.length - 1) * wrapW);
    if (next > 0)    next = next * 0.25;           // resist past first image
    if (next < minX) next = minX + (next - minX) * 0.25; // resist past last image

    // Express as % of strip's own width so the unit matches our snap formula
    const stripW = images.length * wrapW;
    strip.style.transform = `translateX(${(next / stripW) * 100}%)`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1 || lockedAxis.current !== "h") return;
    const dx       = e.changedTouches[0].clientX - startX.current;
    const wrapW    = wrapRef.current?.clientWidth ?? 1;
    // Flick velocity: pixels moved vs. threshold
    const THRESHOLD = wrapW * 0.2; // 20 % of width to trigger slide

    let next = selected;
    if (dx < -THRESHOLD && selected < images.length - 1) next = selected + 1;
    else if (dx >  THRESHOLD && selected > 0)             next = selected - 1;

    snapTo(next);
  };

  return (
    <div>
      {/* Main image — full width, no border-radius, gray bg */}
      <div
        ref={wrapRef}
        className="relative w-full"
        style={{ paddingBottom: "125%", backgroundColor: "var(--bg-card)", touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0" style={{ overflow: "hidden" }}>

          {/* Sliding strip — transform is driven by ref (real-time drag) */}
          {images.length > 0 && (
            <div
              ref={stripRef}
              style={{
                display:    "flex",
                width:      `${images.length * 100}%`,
                height:     "100%",
                transform:  `translateX(-${selected * (100 / images.length)}%)`,
                transition: "transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)",
                willChange: "transform",
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  style={{
                    position:  "relative",
                    width:     `${100 / images.length}%`,
                    flexShrink: 0,
                    height:    "100%",
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Dot navigation — bottom center of image */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => snapTo(i)}
                  aria-label={`Bilde ${i + 1}`}
                  style={{
                    width:           i === selected ? "24px" : "8px",
                    height:          "3px",
                    borderRadius:    0,
                    backgroundColor: i === selected ? "#1a1a1a" : "rgba(0,0,0,0.25)",
                    transition:      "width 0.25s ease, background-color 0.25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color thumbnails — only shown if product has color variants */}
      {hasColorVariants && images.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => snapTo(i)}
              className="flex-shrink-0 w-14 h-14 overflow-hidden transition-all"
              style={{
                outline: i === selected ? "2px solid #1a1a1a" : "2px solid transparent",
                outlineOffset: "1px",
                backgroundColor: "var(--bg-card)",
              }}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
