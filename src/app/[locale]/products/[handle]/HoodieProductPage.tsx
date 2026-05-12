import { ProductImages } from "@/components/ProductImages";
import { TrackView } from "@/components/TrackView";
import { ProductRow } from "@/components/ProductRow";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { HoodieAddToCartButton } from "@/components/HoodieAddToCartButton";
import { HoodieDesktopLayout } from "@/components/HoodieDesktopLayout";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/types/shopify";

interface Props {
  product: ShopifyProduct;
  recommendations: ShopifyProduct[];
}

export function HoodieProductPage({ product, recommendations }: Props) {
  const variants = product.variants.edges.map((e) => e.node);
  const images = product.images.edges.map((e) => e.node);
  const price = product.priceRange.minVariantPrice;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <TrackView product={product} />

      {/* Mobile */}
      <div className="md:hidden">
        <ProductImages images={images} title={product.title} variants={variants} />
        <div className="px-4 sm:px-6 pt-4 pb-10">
          <div className="mb-1">
            <h1 className="text-[15px] font-bold leading-snug" style={{ color: "var(--text)" }}>
              {product.title}
            </h1>
          </div>
          <p className="text-[15px] font-normal mb-4" style={{ color: "var(--text)" }}>
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          <div className="mb-4" style={{ height: "1px", backgroundColor: "var(--border)" }} />
          <HoodieAddToCartButton variants={variants} defaultVariantId={variants[0]?.id} />
        </div>
      </div>

      {/* Desktop */}
      <HoodieDesktopLayout product={product} images={images} variants={variants} />

      {/* Recommendations */}
      <div className="px-4 sm:px-6">
        <ProductRow title="You may also like" products={recommendations} />
        <RecentlyViewedSection currentProductId={product.id} />
      </div>
    </div>
  );
}
