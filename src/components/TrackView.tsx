"use client";

import { useEffect } from "react";
import { trackView } from "@/hooks/useRecentlyViewed";
import type { ShopifyProduct } from "@/types/shopify";

export function TrackView({ product }: { product: ShopifyProduct }) {
  useEffect(() => {
    trackView(product);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
