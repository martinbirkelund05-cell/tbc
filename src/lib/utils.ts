/**
 * Shopify sets checkoutUrl to the store's primary domain (thebrandcrate.com).
 * Since that domain points to Vercel (not Shopify), we rewrite it to the
 * myshopify.com domain so checkout always lands on Shopify's servers.
 */
export function fixCheckoutUrl(url: string): string {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!shopifyDomain || !url) return url;
  return url.replace(/^https?:\/\/[^/]+/, `https://${shopifyDomain}`);
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}
