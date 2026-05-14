import { notFound } from "next/navigation";
import { getProduct, getProductRecommendations } from "@/lib/queries";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImages } from "@/components/ProductImages";
import { TrackView } from "@/components/TrackView";
import { ProductRow } from "@/components/ProductRow";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { ProductDesktopLayout } from "@/components/ProductDesktopLayout";
import { HoodieProductPage } from "./HoodieProductPage";
import { formatPrice } from "@/lib/utils";
import { translateDescription } from "@/lib/translate";
import { getCountryCode } from "@/lib/country";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);
  if (!product) return {};
  return {
    title: `${product.title} | TheBrandCrate`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle, locale } = await params;
  const country = await getCountryCode();

  const product = await getProduct(handle, country).catch((err) => {
    console.error("[ProductPage] getProduct failed:", handle, err);
    return null;
  });

  // notFound() must be called outside try/catch in Next.js 16
  if (!product) notFound();

  try {
    const variants = product.variants.edges.map((e) => e.node);
    const images = product.images.edges.map((e) => e.node);
    const recommendations = await getProductRecommendations(product.id, country).catch(() => []);
    const price = product.priceRange.minVariantPrice;

    const isHoodie = product.collections.nodes.some((c) => c.handle === "hoodie");

    if (isHoodie) {
      return <HoodieProductPage product={product} recommendations={recommendations} />;
    }

    const description = product.description
      ? await translateDescription(product.description, locale).catch(() => product.description)
      : undefined;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <TrackView product={product} />

      {/* Mobile layout — hidden on md+ */}
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
          <AddToCartButton variants={variants} defaultVariantId={variants[0]?.id} description={description} productTitle={product.title} productId={product.id} />
        </div>
      </div>

      {/* Desktop layout — hidden below md */}
      <ProductDesktopLayout product={product} images={images} variants={variants} description={description} />

      {/* Recommendations — shown on all breakpoints */}
      <div className="px-4 sm:px-6">
        <ProductRow title="You may also like" products={recommendations} />
        <RecentlyViewedSection currentProductId={product.id} />
      </div>
    </div>
  );
  } catch (err) {
    console.error("[ProductPage] Render error for handle:", handle, err);
    throw err;
  }
}
