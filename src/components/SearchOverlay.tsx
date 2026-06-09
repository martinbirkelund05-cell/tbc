"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/types/shopify";

function getCountryCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.match(/NEXT_COUNTRY=([A-Z]{2})/)?.[1];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<ShopifyProduct[]>([]);
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const country = getCountryCookie();
        const url = `/api/search?q=${encodeURIComponent(q)}${country ? `&country=${country}` : ""}`;
        const res  = await fetch(url);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    doSearch(v);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed left-0 right-0 top-0 z-50"
        style={{
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Search input row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-14">
          <Search size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Søk etter produkter..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: "var(--text)" }}
          />
          <button onClick={onClose} aria-label="Lukk søk" style={{ color: "var(--text-muted)" }}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Results */}
        {(loading || results.length > 0 || (query.length >= 2 && !loading)) && (
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 pb-4"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {loading && (
              <p className="text-[12px] py-6 text-center" style={{ color: "var(--text-muted)" }}>
                Søker...
              </p>
            )}

            {!loading && results.length === 0 && query.length >= 2 && (
              <p className="text-[12px] py-6 text-center" style={{ color: "var(--text-muted)" }}>
                Ingen produkter funnet for «{query}»
              </p>
            )}

            {!loading && results.length > 0 && (
              <ul className="divide-y" style={{ borderTop: "1px solid var(--border)" }}>
                {results.map((product) => {
                  const price = product.priceRange.minVariantPrice;
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 transition-opacity hover:opacity-70"
                      >
                        {/* Thumbnail */}
                        <div
                          className="flex-shrink-0"
                          style={{
                            width: 52,
                            height: 65,
                            backgroundColor: "var(--bg-card)",
                            position: "relative",
                          }}
                        >
                          {product.featuredImage && (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText ?? product.title}
                              fill
                              sizes="52px"
                              className="object-contain"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-medium truncate"
                            style={{ color: "var(--text)" }}
                          >
                            {product.title}
                          </p>
                          <p
                            className="text-[12px] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatPrice(price.amount, price.currencyCode)}
                          </p>
                        </div>

                        {/* Arrow */}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "var(--text-muted)", flexShrink: 0 }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
