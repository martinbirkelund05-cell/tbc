"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";

const DARK = "var(--brand)";
const KEY = "recently_viewed";

interface Props {
  currentProductId: string;
}

export function RecentlyViewedSection({ currentProductId }: Props) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const all: ShopifyProduct[] = raw ? JSON.parse(raw) : [];
      setProducts(all.filter((p) => p.id !== currentProductId).slice(0, 6));
    } catch {}
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-10 pb-10">
      <h2
        className="mb-4 text-[18px]"
        style={{ color: DARK, fontWeight: 700 }}
      >
        Recently viewed
      </h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 -mx-4 sm:-mx-6 lg:-mx-8"
        style={{ gap: "8px", padding: "8px" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
