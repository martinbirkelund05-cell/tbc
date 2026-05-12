"use client";

import { useState, useTransition } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";

interface Props {
  initialProducts: ShopifyProduct[];
  initialCursor: string | null;
  initialHasNext: boolean;
  loadMore: (cursor: string) => Promise<{
    products: ShopifyProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  }>;
}

export function CollectionGrid({
  initialProducts,
  initialCursor,
  initialHasNext,
  loadMore,
}: Props) {
  // Each fetched page stored so we can navigate back without re-fetching
  const [pages, setPages] = useState<ShopifyProduct[][]>([initialProducts]);
  const [cursors, setCursors] = useState<(string | null)[]>([initialCursor]);
  const [hasNextPerPage, setHasNextPerPage] = useState<boolean[]>([initialHasNext]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const totalKnown = pages.length;
  const hasNextFromLast = hasNextPerPage[totalKnown - 1];
  const canGoNext = currentPage < totalKnown - 1 || hasNextFromLast;

  const goToPage = (idx: number) => {
    if (idx === currentPage || isPending) return;
    if (idx < totalKnown) {
      setCurrentPage(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const cursor = cursors[idx - 1];
    if (!cursor) return;
    startTransition(async () => {
      const result = await loadMore(cursor);
      setPages((prev) => [...prev, result.products]);
      setCursors((prev) => [...prev, result.pageInfo.endCursor]);
      setHasNextPerPage((prev) => [...prev, result.pageInfo.hasNextPage]);
      setCurrentPage(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const products = pages[currentPage] ?? [];

  return (
    <>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 -mx-4 sm:-mx-6 lg:-mx-8"
        style={{ gap: "8px", padding: "8px" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {(totalKnown > 1 || hasNextFromLast) && (
        <div className="py-8">
          {(() => {
            const start = Math.max(0, currentPage - 1);
            const maxAvailable = totalKnown - 1 + (hasNextFromLast ? 1 : 0);
            const end = Math.min(currentPage + 1, maxAvailable);
            const showArrow = end < maxAvailable;

            const items = Array.from({ length: end - start + 1 }, (_, i) => start + i);

            return (
              <div
                className="flex items-stretch justify-center"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {items.map((idx) => {
                  const isActive = idx === currentPage;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx)}
                      disabled={isPending}
                      className="relative px-5 pb-3 pt-1 text-[13px] disabled:opacity-40 transition-opacity"
                      style={{ color: "var(--brand)", fontWeight: isActive ? 500 : 400 }}
                    >
                      {idx + 1}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 right-0"
                          style={{ height: "2px", backgroundColor: "var(--brand)", marginBottom: "-1px" }}
                        />
                      )}
                    </button>
                  );
                })}
                {showArrow && (
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={isPending}
                    className="px-5 pb-3 pt-1 text-[13px] disabled:opacity-40 transition-opacity"
                    style={{ color: "var(--brand)" }}
                  >
                    {isPending ? "…" : ">"}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
