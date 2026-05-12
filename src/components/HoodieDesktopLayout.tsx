"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ExpressCheckout } from "@/components/ExpressCheckout";
import { FindYourSize } from "@/components/FindYourSize";
import type { ShopifyProduct, ShopifyImage, ShopifyProductVariant } from "@/types/shopify";

const DARK = "var(--brand)";
const C = "#3D4A2D";
const SEP = "1px solid #e8e4de";

const HOODIE_DATA = {
  in: [
    { size: "XS", length: 26, width: 21, sleeve: 22 },
    { size: "S",  length: 28, width: 23, sleeve: 23 },
    { size: "M",  length: 29, width: 24, sleeve: 23 },
    { size: "L",  length: 30, width: 25, sleeve: 24 },
    { size: "XL", length: 31, width: 26, sleeve: 24 },
  ],
  cm: [
    { size: "XS", length: 66, width: 53, sleeve: 56 },
    { size: "S",  length: 71, width: 57, sleeve: 57 },
    { size: "M",  length: 74, width: 61, sleeve: 57 },
    { size: "L",  length: 76, width: 63, sleeve: 62 },
    { size: "XL", length: 79, width: 66, sleeve: 62 },
  ],
};

function HoodieSizeTable() {
  const [unit, setUnit] = useState<"in" | "cm">("cm");
  const rows = HOODIE_DATA[unit];
  const cols = ["SIZE", "LENGTH (A)", "WIDTH (B)", "SLEEVE (C)"];

  return (
    <div>
      <div className="flex gap-5 mb-4">
        {(["cm", "in"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: "2px 0", color: unit === u ? C : "#aaa", borderBottom: unit === u ? `2px solid ${C}` : "2px solid transparent", transition: "color 0.15s, border-color 0.15s" }}>
            {u}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: SEP }}>
            {cols.map((col) => (
              <th key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: C, textAlign: "left", paddingBottom: 8, paddingRight: 8 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.size} style={{ borderBottom: i < rows.length - 1 ? SEP : "none" }}>
              {[row.size, row.length, row.width, row.sleeve].map((val, j) => (
                <td key={j} style={{ fontSize: 12, color: C, padding: "8px 8px 8px 0" }}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>Measurements may vary by up to 2 cm / 1 in.</p>
    </div>
  );
}

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
}

export function HoodieDesktopLayout({ product, images, variants }: Props) {
  const { addItem, isLoading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("Details");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
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
  };

  const handleSelectSize = (sizeTitle: string) => {
    const match = variants.find((v) => v.title.toUpperCase() === sizeTitle.toUpperCase());
    if (match?.availableForSale) setSelectedVariantId(match.id);
  };

  const scales = [
    { label: "Fabric thickness", left: "Lightweight", right: "Heavyweight", pct: 70 },
    { label: "Softness scale",   left: "Extra rough",  right: "Extra soft",  pct: 75 },
  ];

  const accordionItems = [
    {
      label: "Details",
      content: (
        <div style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col gap-1.5 mb-5">
            {[
              ["Material", "80% Cotton, 20% Recycled Polyester"],
              ["Print", "DTG (Direct to Garment)"],
              ["Weight", "319 GSM (9.4 oz/yd²)"],
              ["Features", "Ribbed cuffs · Kangaroo pocket · Pre-shrunk"],
              ["Origin", "Made in Vietnam"],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between text-[12px]">
                <span style={{ color: "var(--text-muted)" }}>{key}</span>
                <span style={{ color: "var(--text)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: 16 }} />
          {scales.map(({ label: sl, left, right, pct }) => (
            <div key={sl} className="mb-5">
              <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--text)" }}>{sl}</p>
              <div style={{ height: 4, backgroundColor: "#e8e4de", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: C, borderRadius: 2 }} />
              </div>
              <div className="flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span>{left}</span><span>{right}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Size Guide",
      content: (
        <>
          <button
            onClick={() => setSizeGuideOpen(true)}
            className="text-[17px] font-medium transition-opacity hover:opacity-60"
            style={{ color: C, textDecoration: "underline", textUnderlineOffset: "3px", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 0 }}
          >
            Find Your Size →
          </button>
          <div style={{ height: "1px", backgroundColor: "#e8e4de", margin: "14px 0" }} />
          <HoodieSizeTable />
        </>
      ),
    },
    {
      label: "Returns",
      content: (
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          We accept returns within 14 days of delivery. Items must be unworn and in original condition. Return shipping is covered by the customer. Start your return at thebrandcrate.com/support/returns.
        </p>
      ),
    },
  ];

  return (
    <div className="hidden md:flex" style={{ alignItems: "flex-start", gap: 0 }}>
      {/* Left: image grid */}
      <div style={{ width: "60%", flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        {images.map((img, i) => (
          <div key={i} ref={(el) => { imageRefs.current[i] = el; }} style={{ position: "relative", paddingBottom: "125%", backgroundColor: "var(--bg-card)" }}>
            <Image src={img.url} alt={img.altText ?? product.title} fill sizes="30vw" className="object-contain" priority={i === 0} />
          </div>
        ))}
      </div>

      {/* Right: sticky info */}
      <div style={{ width: "40%", position: "sticky", top: "64px", padding: "0 32px 40px 28px", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
        <div className="flex justify-between items-start mb-2 pt-1">
          <h1 className="text-[15px] font-bold leading-snug flex-1 pr-2" style={{ color: "var(--text)" }}>{product.title}</h1>
          <button onClick={() => setSaved((s) => !s)} className="flex-shrink-0 transition-colors" style={{ color: saved ? "#c0392b" : "#1a1a1a" }} aria-label="Save">
            <HeartIcon filled={saved} />
          </button>
        </div>

        <p className="text-[15px] mb-4" style={{ color: "var(--text)" }}>
          {formatPrice(price.amount, price.currencyCode)}
        </p>

        <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />

        {showSizes && (
          <div className="mb-5">
            <div className="flex gap-5">
              {variants.map((v) => {
                const isSel = v.id === selectedVariantId;
                const isAvail = v.availableForSale;
                return (
                  <button key={v.id} onClick={() => isAvail && setSelectedVariantId(v.id)} disabled={!isAvail} className="text-[13px] transition-all"
                    style={{ fontWeight: isSel ? 700 : 400, textDecoration: isSel ? "underline" : isAvail ? "none" : "line-through", textUnderlineOffset: "3px", color: isAvail ? "#1a1a1a" : "#c0c0c0", cursor: isAvail ? "pointer" : "not-allowed" }}>
                    {v.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />

        <div className="mb-2">
          <button onClick={handleAddToCart} disabled={isLoading || !available} className="w-full py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase text-white transition-colors"
            style={{ backgroundColor: !available ? "#c0c0c0" : added ? "#4a6830" : "#1E2B15" }}>
            {isLoading ? "..." : added ? "Lagt til ✓" : !available ? "Utsolgt" : "Add To Cart"}
          </button>
        </div>

        <div className="mb-3">
          <ExpressCheckout variantId={selectedVariantId} amount={selectedVariant?.price.amount ?? "0"} currencyCode={selectedVariant?.price.currencyCode ?? "NOK"} />
        </div>

        {/* Accordion */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {accordionItems.map(({ label, content }) => (
            <div key={label} style={{ borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setOpenAccordion((o) => (o === label ? "" : label))} className="w-full flex justify-between items-center py-3.5">
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text)" }}>{label}</span>
                <span className="text-lg font-light leading-none" style={{ color: "var(--text)" }}>{openAccordion === label ? "−" : "+"}</span>
              </button>
              {openAccordion === label && <div className="pb-3.5">{content}</div>}
            </div>
          ))}
        </div>

        {sizeGuideOpen && (
          <FindYourSize onClose={() => setSizeGuideOpen(false)} onSelectSize={handleSelectSize} productType="hoodie" />
        )}
      </div>
    </div>
  );
}
