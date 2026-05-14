"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useTranslations } from 'next-intl';
import { formatPrice, fixCheckoutUrl } from "@/lib/utils";
import { trackEvent } from "@/lib/ga";
import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/types/shopify";
import { CURRENCY_THRESHOLDS } from "@/lib/shipping";

const DARK = "var(--brand)";
const RECO_PAGE_SIZE = 12;

function getCountryCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/NEXT_COUNTRY=([A-Z]{2})/);
  return match?.[1];
}

export function CartDrawer() {
  const t = useTranslations('cart');
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading, addItem } = useCart();
  const [showAll, setShowAll] = useState(false);
  const [freshProducts, setFreshProducts] = useState<ShopifyProduct[]>([]);

  // Sheet state for quick-add on recommendation cards
  const [sheetProduct, setSheetProduct] = useState<ShopifyProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const cartProductIds = lines.map((l) => l.merchandise.product.handle);

  // Re-reads localStorage every time cart opens
  const allViewed = useRecentlyViewed(isOpen);
  const cachedViewed = allViewed.filter((p) => !cartProductIds.includes(p.handle));

  useEffect(() => {
    if (!isOpen) setFreshProducts([]);
  }, [isOpen]);

  // Re-fetch recently viewed with correct country/currency when cart opens
  useEffect(() => {
    if (!isOpen || cachedViewed.length === 0) return;
    const handles = cachedViewed.map((p) => p.handle).join(",");
    const country = getCountryCookie();
    const url = `/api/products?handles=${handles}${country ? `&country=${country}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((products: ShopifyProduct[]) => {
        setFreshProducts(products.filter((p) => !cartProductIds.includes(p.handle)));
      })
      .catch(() => setFreshProducts(cachedViewed));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const recentlyViewed = freshProducts.length > 0 ? freshProducts : cachedViewed;

  if (!isOpen) return null;

  const subtotal = parseFloat(cart?.cost.subtotalAmount.amount ?? "0");
  const currencyCode = cart?.cost.subtotalAmount.currencyCode ?? "NOK";
  const freeShippingThreshold = CURRENCY_THRESHOLDS[currencyCode] ?? 100;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const hasFreeShipping = remaining === 0;

  const sheetVariants = sheetProduct?.variants.edges.map((e) => e.node) ?? [];
  const showSizes =
    sheetVariants.length > 1 || sheetVariants[0]?.title !== "Default Title";

  const handleQuickAdd = async (product: ShopifyProduct) => {
    const variants = product.variants.edges.map((e) => e.node);
    const needsPicker =
      variants.length > 1 || variants[0]?.title !== "Default Title";
    if (!needsPicker) {
      const v = variants[0];
      if (!v) return;
      setAdding(true);
      await addItem(v.id, 1, true);
      setAdding(false);
      setConfirmedId(product.id);
      setTimeout(() => setConfirmedId(null), 1500);
    } else {
      setSheetProduct(product);
    }
  };

  const handleSheetAdd = async (variantId: string) => {
    if (adding) return;
    setSheetProduct(null);
    setAdding(true);
    await addItem(variantId, 1, true);
    setAdding(false);
  };

  const visible = showAll
    ? recentlyViewed
    : recentlyViewed.slice(0, RECO_PAGE_SIZE);

  return (
    <>
      <div
        className="fixed right-0 top-0 h-full w-full sm:max-w-[420px] z-50 flex flex-col"
        style={{ backgroundColor: "#ffffff", boxShadow: "-4px 0 24px rgba(0,0,0,0.07)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <span className="text-[15px]" style={{ color: DARK }}>{t('title')}</span>
          <button onClick={closeCart} aria-label="Close cart" style={{ color: DARK }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-5">
              <p className="text-[14px]" style={{ color: "#aaa" }}>{t('empty')}</p>
            </div>
          ) : (
            <ul>
              {lines.map((line, i) => {
                const merch = line.merchandise;
                const showVariant = merch.title !== "Default Title";
                return (
                  <li key={line.id}>
                    <div className="flex gap-4 px-5 py-4" style={{ alignItems: "stretch" }}>
                      <Link
                        href={`/products/${merch.product.handle}`}
                        onClick={closeCart}
                        className="flex-shrink-0 overflow-hidden"
                        style={{ width: 100, height: 125, backgroundColor: "#f2f2f0", display: "block" }}
                      >
                        {merch.product.featuredImage ? (
                          <Image
                            src={merch.product.featuredImage.url}
                            alt={merch.product.featuredImage.altText ?? merch.product.title}
                            width={100}
                            height={125}
                            className="w-full h-full object-contain"
                          />
                        ) : <div className="w-full h-full" />}
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between" style={{ minHeight: 125 }}>
                        <div>
                          <Link
                            href={`/products/${merch.product.handle}`}
                            onClick={closeCart}
                            className="text-[14px] font-normal leading-snug block"
                            style={{ color: DARK }}
                          >
                            {merch.product.title}
                          </Link>
                          <p className="text-[14px] mt-0.5" style={{ color: DARK }}>
                            {formatPrice(merch.price.amount, merch.price.currencyCode)}
                          </p>
                          {showVariant && (
                            <p className="text-[10px] mt-1.5 uppercase tracking-[0.1em]" style={{ color: "#aaa" }}>
                              {merch.title}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center" style={{ gap: "16px" }}>
                            <button
                              onClick={() => updateItem(line.id, line.quantity - 1)}
                              disabled={isLoading || line.quantity <= 1}
                              className="text-[18px] leading-none disabled:opacity-30 transition-opacity"
                              style={{ color: DARK }}
                            >−</button>
                            <span className="text-[14px]" style={{ color: DARK }}>{line.quantity}</span>
                            <button
                              onClick={() => updateItem(line.id, line.quantity + 1)}
                              disabled={isLoading}
                              className="text-[18px] leading-none disabled:opacity-30 transition-opacity"
                              style={{ color: DARK }}
                            >+</button>
                          </div>
                          <button
                            onClick={() => removeItem(line.id)}
                            disabled={isLoading}
                            className="text-[12px] underline disabled:opacity-30 transition-opacity"
                            style={{ color: DARK }}
                          >{t('remove')}</button>
                        </div>
                      </div>
                    </div>

                    {i < lines.length - 1 && (
                      <div className="mx-5" style={{ height: "1px", backgroundColor: "var(--border)" }} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* You may also like */}
          {visible.length > 0 && (
            <div className="mt-6 pb-4">
              <p
                className="px-5 mb-3 text-[18px]"
                style={{ color: DARK, fontWeight: 700 }}
              >
                You may also like
              </p>

              <div
                className="flex overflow-x-auto px-5"
                style={{ gap: "8px", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
              >
                {visible.map((product) => {
                  const price = product.priceRange.minVariantPrice;
                  const isConfirmed = confirmedId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0"
                      style={{ width: 130, scrollSnapAlign: "start" }}
                    >
                      {/* Image with + button */}
                      <div className="relative" style={{ paddingBottom: "125%", backgroundColor: "#f2f2f0" }}>
                        <Link
                          href={`/products/${product.handle}`}
                          onClick={closeCart}
                          className="absolute inset-0"
                        >
                          {product.featuredImage && (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText ?? product.title}
                              fill
                              sizes="130px"
                              className="object-contain"
                            />
                          )}
                        </Link>
                        {/* Quick-add button */}
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={adding}
                          className="absolute bottom-1.5 right-1.5 w-6 h-6 flex items-center justify-center disabled:opacity-40 transition-opacity"
                          style={{
                            color: isConfirmed ? "#3a6b3a" : DARK,
                          }}
                          aria-label="Hurtig legg til"
                        >
                          {isConfirmed ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="text-[14px] leading-none">+</span>
                          )}
                        </button>
                      </div>

                      <Link href={`/products/${product.handle}`} onClick={closeCart}>
                        <p className="text-[12px] font-normal mt-1.5 leading-snug truncate" style={{ color: DARK }}>
                          {product.title}
                        </p>
                        <p className="text-[12px] mt-0.5" style={{ color: DARK }}>
                          {formatPrice(price.amount, price.currencyCode)}
                        </p>
                      </Link>
                    </div>
                  );
                })}

                {!showAll && recentlyViewed.length >= RECO_PAGE_SIZE && (
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: 80, scrollSnapAlign: "start" }}
                  >
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-[11px] underline text-center"
                      style={{ color: DARK }}
                    >
                      View<br />more
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && (
          <div>
            <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-[12px]" style={{ color: "#888" }}>
                {hasFreeShipping
                  ? t('freeShippingUnlocked')
                  : t('freeShippingProgress', { amount: formatPrice(remaining.toFixed(2), currencyCode) })}
              </p>
            </div>

            <div className="px-5 pt-4 pb-3 flex justify-between items-end" style={{ borderTop: "1px solid var(--border)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#999" }}>Cart</p>
                <p className="text-[15px] mt-1" style={{ color: DARK }}>
                  {cart.totalQuantity} {cart.totalQuantity === 1 ? "Item" : "Items"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#999" }}>Subtotal</p>
                <p className="text-[15px] font-bold mt-1" style={{ color: DARK }}>
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </p>
              </div>
            </div>

            <div className="px-5 pb-2">
              <a
                href={fixCheckoutUrl(cart.checkoutUrl)}
                onClick={() =>
                  trackEvent("begin_checkout", {
                    currency: cart.cost.subtotalAmount.currencyCode,
                    value: parseFloat(cart.cost.subtotalAmount.amount),
                    num_items: cart.totalQuantity,
                    items: lines.map((l) => ({
                      item_id: l.merchandise.product.handle,
                      item_name: l.merchandise.product.title,
                      item_variant: l.merchandise.title !== "Default Title" ? l.merchandise.title : undefined,
                      price: parseFloat(l.merchandise.price.amount),
                      quantity: l.quantity,
                    })),
                  })
                }
                className="block w-full text-center py-4 text-[13px] font-medium tracking-widest uppercase text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--bg-dark)" }}
              >
                {t('checkout')}
              </a>
            </div>

            <p className="text-center text-[11px] pb-8 pt-2" style={{ color: "#aaa" }}>
              {t('shippingNote')}
            </p>
          </div>
        )}
      </div>

      {/* Size sheet portal */}
      {sheetProduct && createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--overlay)", backdropFilter: "blur(1px)" }}
            onClick={() => setSheetProduct(null)}
          />
          <div
            className="relative bg-white w-full"
            style={{ padding: "12px 24px 40px", animation: "slideUp 0.3s ease" }}
          >
            <div className="flex justify-center mb-6">
              <div style={{ width: "36px", height: "2px", backgroundColor: "#d0d0d0" }} />
            </div>
            <div className="flex justify-center gap-10">
              {sheetVariants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSheetAdd(v.id)}
                  disabled={!v.availableForSale || adding}
                  className="text-[15px] transition-all"
                  style={{
                    color: v.availableForSale ? "#1a1a1a" : "#c0c0c0",
                    textDecoration: !v.availableForSale ? "line-through" : "none",
                    cursor: v.availableForSale ? "pointer" : "not-allowed",
                    opacity: adding ? 0.5 : 1,
                  }}
                >
                  {v.title}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
