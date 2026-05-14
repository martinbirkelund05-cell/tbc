"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/ga";
import type { ShopifyProduct } from "@/types/shopify";

interface Props {
  collectionTitle: string;
  products: ShopifyProduct[];
}

export function TrackCollection({ collectionTitle, products }: Props) {
  useEffect(() => {
    trackEvent("view_item_list", {
      item_list_name: collectionTitle,
      items: products.map((p, i) => ({
        index: i,
        item_id: p.id,
        item_name: p.title,
        price: parseFloat(p.priceRange.minVariantPrice.amount),
        currency: p.priceRange.minVariantPrice.currencyCode,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionTitle]);

  return null;
}
