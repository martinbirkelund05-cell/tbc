"use client";

import { useEffect } from "react";
import { trackView } from "@/hooks/useRecentlyViewed";
import { trackEvent } from "@/lib/ga";
import type { ShopifyProduct } from "@/types/shopify";

export function TrackView({ product }: { product: ShopifyProduct }) {
  useEffect(() => {
    trackView(product);

    const price = product.priceRange.minVariantPrice;
    trackEvent("view_item", {
      currency: price.currencyCode,
      value: parseFloat(price.amount),
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: parseFloat(price.amount),
        },
      ],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}
