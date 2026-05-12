"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Menu, Search, User, Lock, X } from "lucide-react";
import { SlideMenu } from "@/components/SlideMenu";
import type { ShopifyCollection, ShopifyPolicies } from "@/lib/queries";

export function Navbar({ collections, policies }: { collections: ShopifyCollection[]; policies: ShopifyPolicies }) {
  const t = useTranslations('nav');
  const { cart, openCart } = useCart();
  const quantity = cart?.totalQuantity ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [navTop, setNavTop] = useState(40);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isHome = pathname === "/" || /^\/(en|de|fr|da|nl)\/?$/.test(pathname);
  const ANNOUNCEMENT_H = 40;

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setAtTop(current <= 10);
      setNavTop(Math.max(0, ANNOUNCEMENT_H - current));
      if (current > lastScrollY.current) {
        setScrollingDown(true);
      } else {
        setScrollingDown(false);
      }
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Home: transparent at top or scrolling down, solid white on scroll up; other pages: always solid
  const fullyTransparent = isHome && (atTop || scrollingDown);

  const color = fullyTransparent ? "#ffffff" : "var(--brand)";
  const bg = fullyTransparent ? "transparent" : "var(--bg)";
  const border = fullyTransparent ? "transparent" : "var(--border)";

  return (
    <header
      className="fixed left-0 right-0 z-40"
      style={{
        top: `${navTop}px`,
        backgroundColor: bg,
        borderBottom: `1px solid ${border}`,
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center">
        {/* Left — hamburger + search */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-0.5 -ml-0.5"
            style={{ color, transition: "color 0.3s ease" }}
            aria-label={t('menu')}
          >
            {menuOpen ? <X size={16} strokeWidth={1.75} /> : <Menu size={16} strokeWidth={1.75} />}
          </button>
          <button aria-label={t('search')} className="p-0.5" style={{ color, transition: "color 0.3s ease" }}>
            <Search size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Center — logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-[14px] tracking-tight whitespace-nowrap font-bold"
          style={{ color, transition: "color 0.3s ease" }}
        >
          TheBrandCrate
        </Link>

        {/* Right — user + cart */}
        <div className="flex items-center gap-3 ml-auto">
          <button aria-label={t('profile')} className="p-0.5" style={{ color, transition: "color 0.3s ease" }}>
            <User size={16} strokeWidth={1.75} />
          </button>
          <button
            onClick={openCart}
            className="relative p-0.5"
            aria-label={t('cart')}
            style={{ color, transition: "color 0.3s ease" }}
          >
            <Lock size={16} strokeWidth={1.75} />
            {quantity > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-medium"
                style={{
                  backgroundColor: fullyTransparent ? "#ffffff" : "#1E2B15",
                  color: "#ffffff",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                }}
              >
                {quantity > 9 ? "9+" : quantity}
              </span>
            )}
          </button>
        </div>
      </div>

      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} collections={collections} policies={policies} />
    </header>
  );
}
