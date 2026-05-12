import { shopifyFetch } from "./shopify";
import type { ShopifyProduct, ShopifyCart } from "@/types/shopify";

export interface ShopifyPolicy {
  title: string;
  handle: string;
  body: string;
  url: string;
}

export interface ShopifyPolicies {
  privacyPolicy: ShopifyPolicy | null;
  termsOfService: ShopifyPolicy | null;
  refundPolicy: ShopifyPolicy | null;
  shippingPolicy: ShopifyPolicy | null;
}

export async function getShopPolicies(): Promise<ShopifyPolicies> {
  const query = `{
    shop {
      privacyPolicy { title handle body url }
      termsOfService { title handle body url }
      refundPolicy { title handle body url }
      shippingPolicy { title handle body url }
    }
  }`;
  const data = await shopifyFetch<{ shop: ShopifyPolicies }>(query);
  return data.shop;
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    collections(first: 5) {
      nodes {
        handle
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product {
                title
                handle
                featuredImage { url altText width height }
              }
            }
          }
        }
      }
    }
  }
`;

// Products

export async function getProducts(first = 12, country?: string): Promise<ShopifyProduct[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!, $country: CountryCode) @inContext(country: $country) {
      products(first: $first) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { edges: { node: ShopifyProduct }[] } }>(query, { first }, country);
  return data.products.edges.map((e) => e.node);
}

export async function getProductsByCollection(handle: string, first = 6, country?: string): Promise<ShopifyProduct[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetCollection($handle: String!, $first: Int!, $country: CountryCode) @inContext(country: $country) {
      collection(handle: $handle) {
        products(first: $first) {
          edges {
            node {
              ...ProductFields
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collection: { products: { edges: { node: ShopifyProduct }[] } } | null;
  }>(query, { handle, first }, country);
  return data.collection?.products.edges.map((e) => e.node) ?? [];
}

export interface CollectionPage {
  title: string;
  products: ShopifyProduct[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

export async function getCollection(
  handle: string,
  first = 12,
  after?: string,
  country?: string
): Promise<CollectionPage> {
  const query = after
    ? `
      ${PRODUCT_FRAGMENT}
      query GetCollectionPage($handle: String!, $first: Int!, $after: String!, $country: CountryCode) @inContext(country: $country) {
        collection(handle: $handle) {
          title
          products(first: $first, after: $after, sortKey: BEST_SELLING) {
            pageInfo { hasNextPage endCursor }
            edges { node { ...ProductFields } }
          }
        }
      }
    `
    : `
      ${PRODUCT_FRAGMENT}
      query GetCollectionPage($handle: String!, $first: Int!, $country: CountryCode) @inContext(country: $country) {
        collection(handle: $handle) {
          title
          products(first: $first, sortKey: BEST_SELLING) {
            pageInfo { hasNextPage endCursor }
            edges { node { ...ProductFields } }
          }
        }
      }
    `;

  const variables = after ? { handle, first, after } : { handle, first };

  const data = await shopifyFetch<{
    collection: {
      title: string;
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        edges: { node: ShopifyProduct }[];
      };
    } | null;
  }>(query, variables, country);

  const collection = data.collection;
  const products = collection?.products.edges.map((e) => e.node) ?? [];
  return {
    title: collection?.title ?? handle,
    products,
    pageInfo: collection?.products.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
}

export interface ShopifyCollection {
  handle: string;
  title: string;
  updatedAt: string;
}

export async function getAllCollections(): Promise<ShopifyCollection[]> {
  const query = `
    query GetAllCollections {
      collections(first: 50, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            handle
            title
            updatedAt
          }
        }
      }
    }
  `;
  const data = await shopifyFetch<{
    collections: { edges: { node: ShopifyCollection }[] };
  }>(query);
  return data.collections.edges.map((e) => e.node);
}

export async function getProductRecommendations(productId: string, country?: string): Promise<ShopifyProduct[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetRecommendations($productId: ID!, $country: CountryCode) @inContext(country: $country) {
      productRecommendations(productId: $productId) {
        ...ProductFields
      }
    }
  `;
  const data = await shopifyFetch<{ productRecommendations: ShopifyProduct[] }>(query, { productId }, country);
  return data.productRecommendations.slice(0, 6);
}

export async function getProduct(handle: string, country?: string): Promise<ShopifyProduct | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!, $country: CountryCode) @inContext(country: $country) {
      product(handle: $handle) {
        ...ProductFields
      }
    }
  `;

  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(query, { handle }, country);
  return data.product;
}

// Cart

export async function createCart(country?: string): Promise<ShopifyCart> {
  const query = `
    ${CART_FRAGMENT}
    mutation CartCreate($country: CountryCode) @inContext(country: $country) {
      cartCreate {
        cart {
          ...CartFields
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(query, {}, country);
  return data.cartCreate.cart;
}

export async function getCart(cartId: string, country?: string): Promise<ShopifyCart | null> {
  const query = `
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!, $country: CountryCode) @inContext(country: $country) {
      cart(id: $cartId) {
        ...CartFields
      }
    }
  `;

  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(query, { cartId }, country);
  return data.cart;
}

export async function addToCart(cartId: string, variantId: string, quantity = 1, country?: string): Promise<ShopifyCart> {
  const query = `
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode) @inContext(country: $country) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  }, country);
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number, country?: string): Promise<ShopifyCart> {
  const query = `
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $country: CountryCode) @inContext(country: $country) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFields
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(query, {
    cartId,
    lines: [{ id: lineId, quantity }],
  }, country);
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineId: string, country?: string): Promise<ShopifyCart> {
  const query = `
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $country: CountryCode) @inContext(country: $country) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFields
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(query, {
    cartId,
    lineIds: [lineId],
  }, country);
  return data.cartLinesRemove.cart;
}
