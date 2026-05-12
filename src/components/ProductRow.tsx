import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";

const DARK = "var(--brand)";

interface Props {
  title: string;
  products: ShopifyProduct[];
}

export function ProductRow({ title, products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2
        className="mb-4 text-[18px]"
        style={{ color: DARK, fontWeight: 700 }}
      >
        {title}
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
