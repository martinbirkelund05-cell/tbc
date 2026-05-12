import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import type { ShopifyProduct } from "@/types/shopify";

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    featuredImage { url altText width height }
    images(first: 10) { edges { node { url altText width height } } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
    collections(first: 5) { nodes { handle } }
  }
`;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const handlesParam = searchParams.get("handles") ?? "";
  const country = searchParams.get("country") ?? undefined;

  const handles = handlesParam.split(",").filter(Boolean).slice(0, 20);
  if (handles.length === 0) return NextResponse.json([]);

  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductsByHandles($country: CountryCode) @inContext(country: $country) {
      ${handles.map((h, i) => `p${i}: product(handle: "${h}") { ...ProductFields }`).join("\n")}
    }
  `;

  try {
    const data = await shopifyFetch<Record<string, ShopifyProduct | null>>(query, {}, country);
    const products = handles
      .map((_, i) => data[`p${i}`])
      .filter((p): p is ShopifyProduct => p !== null);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}
