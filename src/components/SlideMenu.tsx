"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { X, ArrowLeft, ChevronRight } from "lucide-react";
import type { ShopifyCollection, ShopifyPolicies } from "@/lib/queries";

const DARK = "var(--brand)";


type Panel = "main" | "clothing" | "collections" | "support" | "policies";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collections: ShopifyCollection[];
  policies: ShopifyPolicies;
}

export function SlideMenu({ isOpen, onClose, collections, policies }: Props) {
  const t = useTranslations('menu');
  const [panel, setPanel] = useState<Panel>("main");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  // Always reset to main when the menu opens
  useEffect(() => {
    if (isOpen) setPanel("main");
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!mounted) return null;

  const policyLinks = [
    policies.privacyPolicy,
    policies.termsOfService,
    policies.refundPolicy,
    policies.shippingPolicy,
  ]
    .filter(Boolean)
    .map((p) => ({ label: p!.title, href: `/policies/${p!.handle}` }));

  const hoodiesCollection = collections.find((c) =>
    c.handle.toLowerCase().includes("hoodie")
  );
  const CLOTHING_LINKS = [
    { label: "T-Shirts", href: "/collections/t-shirts" },
    {
      label: hoodiesCollection?.title ?? (t('hoodies') || "Hoodies"),
      href: hoodiesCollection ? `/collections/${hoodiesCollection.handle}` : "/collections/hoodies",
    },
  ];
  const SUPPORT_LINKS = [
    { label: t('returnsExchange'), href: "/support/returns" },
    { label: t('orderTracking'), href: "/support/tracking" },
    { label: t('faq'), href: "/support/faq" },
    { label: t('contact'), href: "/support/contact" },
  ];

  const subLinks =
    panel === "clothing"
      ? CLOTHING_LINKS
      : panel === "collections"
      ? collections.map((c) => ({ label: c.title, href: `/collections/${c.handle}` }))
      : panel === "policies"
      ? policyLinks
      : SUPPORT_LINKS;
  const subTitle =
    panel === "clothing" ? t('clothing')
    : panel === "collections" ? "Collections"
    : panel === "policies" ? t('policies')
    : t('support');
  const onSub = panel !== "main";

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 50, pointerEvents: isOpen ? "auto" : "none" }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--overlay)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 51,
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width: "min(80vw, 400px)",
          backgroundColor: "var(--bg)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: 52,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sliding inner track — holds main + sub side by side */}
        <div
          style={{
            display: "flex",
            width: "200%",
            flex: 1,
            transform: onSub ? "translateX(-50%)" : "translateX(0)",
            transition: "transform 0.3s ease",
            overflow: "hidden",
          }}
        >
          {/* ── MAIN PANEL ── */}
          <div
            style={{
              width: "50%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Close */}
            <div className="flex justify-end px-5 pt-5 pb-2">
              <button onClick={onClose} aria-label="Close menu" style={{ color: DARK }}>
                <X size={22} strokeWidth={1.75} />
              </button>
            </div>

            {/* Featured links */}
            <div className="px-6 pt-2 pb-6">
              <Link
                href="/collections/new-arrivals"
                onClick={onClose}
                style={{ color: DARK, display: "block" }}
              >
                <span
                  className="block py-1 leading-tight"
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                >
                  {t('newArrivals')}
                </span>
              </Link>
              <Link
                href="/collections/best-sellers"
                onClick={onClose}
                style={{ color: DARK, display: "block" }}
              >
                <span
                  className="block py-1 leading-tight"
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                >
                  {t('bestSellers')}
                </span>
              </Link>
            </div>

            {/* Category rows */}
            <div className="flex-1 px-6 flex flex-col">
              <CategoryRow label={t('clothing')} onClick={() => setPanel("clothing")} />
              <CategoryRow label="Collections" onClick={() => setPanel("collections")} />
            </div>

            {/* Support + Policies — pinned bottom */}
            <div className="px-6 pb-10">
              <CategoryRow label={t('support')} onClick={() => setPanel("support")} />
              <CategoryRow label={t('policies')} onClick={() => setPanel("policies")} />
            </div>
          </div>

          {/* ── SUB PANEL ── */}
          <div
            style={{
              width: "50%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Back */}
            <div className="flex items-center px-5 pt-5 pb-4">
              <button
                onClick={() => setPanel("main")}
                className="flex items-center gap-1.5 text-[13px] tracking-wide"
                style={{ color: DARK }}
                aria-label="Back"
              >
                <ArrowLeft size={16} strokeWidth={1.75} />
                Back
              </button>
            </div>

            {/* Sub title */}
            <div className="px-6 pb-4">
              <span
                className="text-[11px] uppercase tracking-widest font-medium"
                style={{ color: DARK, opacity: 0.45 }}
              >
                {subTitle}
              </span>
            </div>

            {/* Sub links */}
            <div className="flex-1 px-6 flex flex-col overflow-y-auto">
              {subLinks.map((link, i) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-3.5 text-[15px]"
                    style={{ color: DARK }}
                  >
                    {link.label}
                    <ChevronRight size={16} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                  </Link>
                  {i < subLinks.length - 1 && (
                    <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  label,
  href,
  onClick,
  onClose,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  onClose?: () => void;
}) {
  const inner = (
    <div
      className="flex items-center justify-between py-3.5 text-[15px]"
      style={{ color: DARK }}
    >
      {label}
      <ChevronRight size={16} strokeWidth={1.5} style={{ opacity: 0.5 }} />
    </div>
  );

  return (
    <div>
      {href ? (
        <Link href={href} onClick={onClose}>
          {inner}
        </Link>
      ) : (
        <button className="w-full text-left" onClick={onClick}>
          {inner}
        </button>
      )}
      <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
    </div>
  );
}
