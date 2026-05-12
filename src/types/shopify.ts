export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoneyV2;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  variants: { edges: { node: ShopifyProductVariant }[] };
  collections: { nodes: { handle: string }[] };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoneyV2;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoneyV2;
    totalAmount: ShopifyMoneyV2;
    totalTaxAmount: ShopifyMoneyV2 | null;
  };
  lines: { edges: { node: ShopifyCartLine }[] };
}
