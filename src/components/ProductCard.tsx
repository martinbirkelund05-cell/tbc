"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ShopifyProduct } from "@/types/shopify";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useTranslations } from "next-intl";

const COLOR_MAP: Record<string, string> = {
  black: "#1A1A1A", white: "#F0F0F0", navy: "#1B2A4A", blue: "#2563EB",
  red: "#DC2626", green: "#16A34A", yellow: "#EAB308", pink: "#EC4899",
  grey: "#9CA3AF", gray: "#9CA3AF", cream: "#F5F0E8", brown: "#92400E",
  beige: "#D4B896", orange: "#EA580C", purple: "#9333EA", sand: "#C8B89A",
  ecru: "#E8DCC8", marshmallow: "#F5F0EC", "off white": "#F5F0E8",
};

function getColorDot(colorName: string): string | null {
  const lower = colorName.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

function getBadgeKey(product: ShopifyProduct): "newIn" | "mostWanted" | null {
  const handles = product.collections?.nodes.map((n) => n.handle) ?? [];
  if (handles.includes("new-arrivals")) return "newIn";
  if (handles.includes("best-sellers")) return "mostWanted";
  return null;
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const t = useTranslations("product");
  const price = product.priceRange.minVariantPrice;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef(0);
  const didSwipe = useRef(false);
  const { addItem } = useCart();

  const images = product.images.edges.map((e) => e.node);
  const currentImage = images[imgIndex] ?? product.featuredImage;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) return;
    didSwipe.current = true;
    setImgIndex((prev) =>
      delta < 0
        ? Math.min(prev + 1, images.length - 1)
        : Math.max(prev - 1, 0)
    );
  };

  const confirmAdd = () => {
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 1500);
  };
  const badgeKey = getBadgeKey(product);
  const badge = badgeKey ? t(badgeKey) : null;

  const variants = product.variants.edges.map((e) => e.node);
  const showSizes = variants.length > 1 || variants[0]?.title !== "Default Title";

  const colorOptions = variants
    .flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === "color"))
    .filter((o, i, arr) => arr.findIndex((x) => x.value === o.value) === i);

  useEffect(() => { setMounted(true); }, []);

  const openSheet = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!showSizes) {
      const v = variants[0];
      if (!v) return;
      setAdding(true);
      await addItem(v.id, 1, true);
      setAdding(false);
      confirmAdd();
      return;
    }
    const firstAvailable = variants.find((v) => v.availableForSale);
    setSelectedId(firstAvailable?.id ?? variants[0]?.id ?? "");
    setSheetOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedId || adding) return;
    setAdding(true);
    await addItem(selectedId, 1);
    setAdding(false);
    setSheetOpen(false);
  };

  const selectedVariant = variants.find((v) => v.id === selectedId);

  return (
    <>
      <Link
        href={`/products/${product.handle}`}
        className="block"
        onClick={(e) => { if (didSwipe.current) { didSwipe.current = false; e.preventDefault(); } }}
      >
        {/* Image section */}
        <div
          className="relative"
          style={{ paddingBottom: "125%", backgroundColor: "var(--bg-card)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0">
            {badge && (
              <span
                className="absolute top-1.5 left-1.5 z-10 text-[9px] font-normal tracking-wide px-1.5 py-0.5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  color: "var(--text)",
                  borderRadius: "9999px",
                }}
              >
                {badge}
              </span>
            )}
            {currentImage && (
              <Image
                src={currentImage.url}
                alt={currentImage.altText ?? product.title}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* Text section */}
        <div className="bg-white px-2 pt-2 pb-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-[13px] font-bold leading-snug truncate flex-1 min-w-0" style={{ color: "var(--text)" }}>
              {product.title}
            </h3>
            <button
              onClick={openSheet}
              disabled={adding}
              className="flex-shrink-0 leading-none disabled:opacity-40 transition-all"
              style={{ color: confirmed ? "#3a6b3a" : "var(--text-muted)" }}
              aria-label="Velg størrelse"
            >
              {adding ? (
                <span className="text-lg">…</span>
              ) : confirmed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <span className="text-lg">+</span>
              )}
            </button>
          </div>
          <p className="text-[11px] font-normal" style={{ color: "var(--text)", marginTop: "-8px" }}>
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          {colorOptions.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {colorOptions.map((opt) => {
                const hex = getColorDot(opt.value);
                return (
                  <span
                    key={opt.value}
                    title={opt.value}
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: hex ?? "#ccc", boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Link>

      {/* Bottom sheet portal */}
      {mounted && sheetOpen && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--overlay)", backdropFilter: "blur(1px)" }}
            onClick={() => setSheetOpen(false)}
          />

          {/* Sheet */}
          <div
            className="relative bg-white w-full"
            style={{
              padding: "12px 24px 40px",
              animation: "slideUp 0.3s ease",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-6">
              <div style={{ width: "36px", height: "2px", backgroundColor: "#d0d0d0" }} />
            </div>

            {/* Sizes */}
            <div className="flex justify-center gap-10 mb-2">
              {variants.map((v) => {
                const isAvailable = v.availableForSale;
                return (
                  <button
                    key={v.id}
                    onClick={async () => {
                      if (!isAvailable || adding) return;
                      setSheetOpen(false);
                      setAdding(true);
                      await addItem(v.id, 1, true);
                      setAdding(false);
                      confirmAdd();
                    }}
                    disabled={!isAvailable || adding}
                    className="text-[15px] transition-all"
                    style={{
                      color: isAvailable ? "#1a1a1a" : "#c0c0c0",
                      textDecoration: !isAvailable ? "line-through" : "none",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      opacity: adding ? 0.5 : 1,
                    }}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
