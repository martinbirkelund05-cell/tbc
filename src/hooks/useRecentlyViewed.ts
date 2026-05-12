"use client";

import { useState, useEffect } from "react";
import type { ShopifyProduct } from "@/types/shopify";

const KEY = "recently_viewed";
const MAX = 20;

export function useRecentlyViewed(trigger?: boolean): ShopifyProduct[] {
  const [viewed, setViewed] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setViewed(raw ? JSON.parse(raw) : []);
    } catch {}
  }, [trigger]);

  return viewed;
}

export function trackView(product: ShopifyProduct) {
  try {
    const raw = localStorage.getItem(KEY);
    const existing: ShopifyProduct[] = raw ? JSON.parse(raw) : [];
    const deduped = existing.filter((p) => p.id !== product.id);
    localStorage.setItem(KEY, JSON.stringify([product, ...deduped].slice(0, MAX)));
  } catch {}
}
