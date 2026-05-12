"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslations } from 'next-intl';
import type { ShopifyProductVariant } from "@/types/shopify";
import { ExpressCheckout } from "@/components/ExpressCheckout";
import { FindYourSize } from "@/components/FindYourSize";

const SIZE_DATA = {
  in: [
    { size: "S",  length: 28, width: 18, sleeve: 16 },
    { size: "M",  length: 29, width: 20, sleeve: 17 },
    { size: "L",  length: 30, width: 22, sleeve: 19 },
    { size: "XL", length: 31, width: 24, sleeve: 20 },
  ],
  cm: [
    { size: "S",  length: 71, width: 46, sleeve: 40 },
    { size: "M",  length: 74, width: 51, sleeve: 43 },
    { size: "L",  length: 76, width: 56, sleeve: 47 },
    { size: "XL", length: 79, width: 61, sleeve: 51 },
  ],
};

const C = "#3D4A2D";
const SEP = "1px solid #e8e4de";

function SizeTable() {
  const [unit, setUnit] = useState<"in" | "cm">("cm");
  const rows = SIZE_DATA[unit];
  const cols = ["SIZE", "LENGTH", "WIDTH", "SLEEVE"];

  return (
    <div>
      {/* Unit toggle */}
      <div className="flex gap-5 mb-4">
        {(["cm", "in"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              background: "none", border: "none", cursor: "pointer", padding: "2px 0",
              color: unit === u ? C : "#aaa",
              borderBottom: unit === u ? `2px solid ${C}` : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: SEP }}>
            {cols.map((col) => (
              <th key={col} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: C, textAlign: "left", paddingBottom: 8, paddingRight: 8 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.size} style={{ borderBottom: i < rows.length - 1 ? SEP : "none" }}>
              {[row.size, row.length, row.width, row.sleeve].map((val, j) => (
                <td key={j} style={{ fontSize: 12, color: C, padding: "8px 8px 8px 0" }}>
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 10 }}>
        Measurements may vary by up to 2 cm / 1 in.
      </p>
    </div>
  );
}

interface Props {
  variants: ShopifyProductVariant[];
  defaultVariantId?: string;
  description?: string;
}

export function AddToCartButton({ variants, defaultVariantId, description }: Props) {
  const t = useTranslations('product');
  const { addItem, isLoading } = useCart();
  const [selectedId, setSelectedId] = useState(defaultVariantId ?? variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const handleSelectSize = (sizeTitle: string) => {
    const match = variants.find((v) => v.title.toUpperCase() === sizeTitle.toUpperCase());
    if (match?.availableForSale) setSelectedId(match.id);
  };

  const selectedVariant = variants.find((v) => v.id === selectedId);
  const available = selectedVariant?.availableForSale ?? false;
  const showSizes = variants.length > 1 || variants[0]?.title !== "Default Title";

  const handleAdd = async () => {
    if (!selectedId || !available) return;
    await addItem(selectedId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      {/* Size selector */}
      {showSizes && (
        <div className="mb-5">
          <div className="flex gap-5">
            {variants.map((v) => {
              const isSelected = v.id === selectedId;
              const isAvailable = v.availableForSale;
              return (
                <button
                  key={v.id}
                  onClick={() => isAvailable && setSelectedId(v.id)}
                  disabled={!isAvailable}
                  className="text-[13px] transition-all"
                  style={{
                    fontWeight: isSelected ? 700 : 400,
                    textDecoration: isSelected
                      ? "underline"
                      : isAvailable
                      ? "none"
                      : "line-through",
                    textUnderlineOffset: "3px",
                    color: isAvailable ? "#1a1a1a" : "#c0c0c0",
                    cursor: isAvailable ? "pointer" : "not-allowed",
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

      {/* Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleAdd}
          disabled={isLoading || !available}
          className="flex-1 py-3.5 text-[12px] font-bold tracking-[0.12em] uppercase text-white transition-all"
          style={{
            backgroundColor: !available ? "#c0c0c0" : added ? "#4a6830" : "#1E2B15",
          }}
        >
          {isLoading ? "..." : added ? "✓" : !available ? t('soldOut') : t('addToCart')}
        </button>

      </div>

      {/* Express checkout (Apple Pay / Google Pay) */}
      <ExpressCheckout
        variantId={selectedId}
        amount={selectedVariant?.price.amount ?? "0"}
        currencyCode={selectedVariant?.price.currencyCode ?? "NOK"}
      />

      {/* Accordion */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {[t('details'), t('sizeGuide'), "Production"].map((label) => {
          const isDetails = label === t('details');
          const isSizeGuide = label === t('sizeGuide');
          const isProduction = label === "Production";
          return (
            <details key={label} className="group" style={{ borderBottom: "1px solid var(--border)" }} open={isDetails}>
              <summary className="flex justify-between items-center py-3.5 cursor-pointer select-none list-none">
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium" style={{ color: "var(--text)" }}>
                  {label}
                </span>
                <span className="text-base font-light group-open:hidden" style={{ color: "var(--text)" }}>+</span>
                <span className="text-base font-light hidden group-open:block" style={{ color: "var(--text)" }}>−</span>
              </summary>
              <div className="pb-3.5">
                {isDetails && (
                  <div style={{ color: "var(--text-muted)" }}>
                    {/* Key specs */}
                    <div className="flex flex-col gap-1.5 mb-5">
                      {[
                        ["Material", "100% Cotton"],
                        ["Print", "DTG (Direct to Garment)"],
                        ["Weight", "180 GSM"],
                      ].map(([key, val]) => (
                        <div key={key} className="flex justify-between text-[12px]">
                          <span style={{ color: "var(--text-muted)" }}>{key}</span>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: 16 }} />

                    {/* Scale bars */}
                    {[
                      { label: "Fabric thickness", left: "Lightweight", right: "Heavyweight", pct: 75 },
                      { label: "Softness scale",   left: "Extra rough",  right: "Extra soft",  pct: 52 },
                    ].map(({ label, left, right, pct }) => (
                      <div key={label} className="mb-5">
                        <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--text)" }}>{label}</p>
                        <div style={{ height: 4, backgroundColor: "#e8e4de", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#1a1a1a", borderRadius: 2 }} />
                        </div>
                        <div className="flex justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
                          <span>{left}</span>
                          <span>{right}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isDetails && !isSizeGuide && !isProduction && (
                  <p className="text-[12px] leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
                    Informasjon om {label.toLowerCase()} vises her.
                  </p>
                )}
                {isProduction && (
                  <div style={{ color: "var(--text-muted)" }}>
                    <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mb-2" style={{ color: "var(--text)" }}>
                      Countries of Production
                    </p>
                    <ul className="text-[12px] leading-relaxed mb-4" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {["Bangladesh", "Dominican Republic", "Honduras", "Haiti", "Mexico", "Nicaragua"].map((c) => (
                        <li key={c} style={{ paddingBottom: 2 }}>{c}</li>
                      ))}
                    </ul>
                    <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: 12 }} />
                    <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mb-2" style={{ color: "var(--text)" }}>
                      Eco-Friendly Practices
                    </p>
                    <p className="text-[12px] leading-relaxed mb-4">
                      Our methods prioritize sustainability by using water-based inks and minimizing waste.
                    </p>
                    <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: 12 }} />
                    <p className="text-[11px] tracking-[0.14em] uppercase font-semibold mb-2" style={{ color: "var(--text)" }}>
                      OEKO-TEX® Certified
                    </p>
                    <p className="text-[12px] leading-relaxed">
                      OEKO-TEX® certification is one of the world&apos;s leading labels for textile safety, proving certified products are free from hazardous chemicals. We list the label in the product description of certified products.
                    </p>
                  </div>
                )}
                {isSizeGuide && (
                  <>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[17px] font-medium transition-opacity hover:opacity-60"
                      style={{ color: "#3D4A2D", textDecoration: "underline", textUnderlineOffset: "3px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Find Your Size →
                    </button>
                    <div style={{ height: "1px", backgroundColor: "#e8e4de", margin: "14px 0" }} />
                    <SizeTable />
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {sizeGuideOpen && (
        <FindYourSize
          onClose={() => setSizeGuideOpen(false)}
          onSelectSize={handleSelectSize}
        />
      )}
    </div>
  );
}
