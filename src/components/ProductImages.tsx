"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShopifyImage, ShopifyProductVariant } from "@/types/shopify";

interface Props {
  images: ShopifyImage[];
  title: string;
  variants: ShopifyProductVariant[];
}

export function ProductImages({ images, title, variants }: Props) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  const hasColorVariants = variants.some((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === "color")
  );

  return (
    <div>
      {/* Main image — full width, no border-radius, gray bg */}
      <div className="relative w-full" style={{ paddingBottom: "125%", backgroundColor: "var(--bg-card)" }}>
        <div className="absolute inset-0">
          {current && (
            <Image
              src={current.url}
              alt={current.altText ?? title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          )}

          {/* Dot navigation — bottom center of image */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  aria-label={`Bilde ${i + 1}`}
                  className="transition-all"
                  style={{
                    width: i === selected ? "24px" : "8px",
                    height: "3px",
                    borderRadius: 0,
                    backgroundColor: i === selected ? "#1a1a1a" : "rgba(0,0,0,0.25)",
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
              onClick={() => setSelected(i)}
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
