"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ExpressCheckout } from "@/components/ExpressCheckout";
import { trackEvent } from "@/lib/ga";
import type { ShopifyProduct, ShopifyImage, ShopifyProductVariant } from "@/types/shopify";

const DARK = "var(--brand)";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

interface Props {
  product: ShopifyProduct;
  images: ShopifyImage[];
  variants: ShopifyProductVariant[];
  description?: string;
}

export function ProductDesktopLayout({ product, images, variants, description }: Props) {
  const { addItem, isLoading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const available = selectedVariant?.availableForSale ?? false;
  const showSizes = variants.length > 1 || variants[0]?.title !== "Default Title";
  const price = product.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!selectedVariantId || !available || isLoading) return;
    await addItem(selectedVariantId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    trackEvent("add_to_cart", {
      currency: selectedVariant?.price.currencyCode,
      value: parseFloat(selectedVariant?.price.amount ?? "0"),
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_variant: selectedVariant?.title,
          price: parseFloat(selectedVariant?.price.amount ?? "0"),
          quantity: 1,
        },
      ],
    });
  };

  return (
    <div className="hidden md:flex" style={{ alignItems: "flex-start", gap: 0 }}>
      {/* Left: 2-per-row image grid */}
      <div
        style={{
          width: "60%",
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            ref={(el) => { imageRefs.current[i] = el; }}
            style={{ position: "relative", paddingBottom: "125%", backgroundColor: "var(--bg-card)" }}
          >
            <Image
              src={img.url}
              alt={img.altText ?? product.title}
              fill
              sizes="30vw"
              className="object-contain"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Right: sticky info column */}
      <div
        style={{
          width: "40%",
          position: "sticky",
          top: "64px",
          padding: "0 32px 40px 28px",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        {/* Title + heart */}
        <div className="flex justify-between items-start mb-2 pt-1">
          <h1 className="text-[15px] font-bold leading-snug flex-1 pr-2" style={{ color: "var(--text)" }}>
            {product.title}
          </h1>
          <button
            onClick={() => setSaved((s) => !s)}
            className="flex-shrink-0 transition-colors"
            style={{ color: saved ? "#c0392b" : "#1a1a1a" }}
            aria-label="Lagre produkt"
          >
            <HeartIcon filled={saved} />
          </button>
        </div>

        {/* Price */}
        <p className="text-[15px] mb-4" style={{ color: "var(--text)" }}>
          {formatPrice(price.amount, price.currencyCode)}
        </p>

        {/* Separator */}
        <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Sizes */}
        {showSizes && (
          <div className="mb-5">
            <div className="flex gap-5">
              {variants.map((v) => {
                const isSel = v.id === selectedVariantId;
                const isAvail = v.availableForSale;
                return (
                  <button
                    key={v.id}
                    onClick={() => isAvail && setSelectedVariantId(v.id)}
                    disabled={!isAvail}
                    className="text-[13px] transition-all"
                    style={{
                      fontWeight: isSel ? 700 : 400,
                      textDecoration: isSel ? "underline" : isAvail ? "none" : "line-through",
                      textUnderlineOffset: "3px",
                      color: isAvail ? "#1a1a1a" : "#c0c0c0",
                      cursor: isAvail ? "pointer" : "not-allowed",
                    }}
                  >
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {/* Add to cart */}
        <div className="mb-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !available}
            className="w-full py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase text-white transition-colors"
            style={{
              backgroundColor: !available ? "#c0c0c0" : added ? "#4a6830" : "#1E2B15",
            }}
          >
            {isLoading ? "..." : added ? "Lagt til ✓" : !available ? "Utsolgt" : "Add To Cart"}
          </button>
        </div>

        {/* Express checkout */}
        <div className="mb-3">
          <ExpressCheckout
            variantId={selectedVariantId}
            amount={selectedVariant?.price.amount ?? "0"}
            currencyCode={selectedVariant?.price.currencyCode ?? "NOK"}
          />
        </div>

        {/* Accordion */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {["Details", "Size Guide", "Returns"].map((label) => (
            <div key={label} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => setOpenAccordion((o) => (o === label ? null : label))}
                className="w-full flex justify-between items-center py-3.5"
              >
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text)" }}>
                  {label}
                </span>
                <span className="text-lg font-light leading-none" style={{ color: "var(--text)" }}>
                  {openAccordion === label ? "−" : "+"}
                </span>
              </button>
              {openAccordion === label && (
                <p className="pb-3.5 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Informasjon om {label.toLowerCase()} vises her.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
