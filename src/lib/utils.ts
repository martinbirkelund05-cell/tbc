/**
 * Ensures the checkout URL points to the myshopify.com domain.
 * In a headless setup, thebrandcrate.com is served by Vercel — not Shopify —
 * so we always rewrite to the Shopify store domain for checkout.
 */
export function fixCheckoutUrl(url: string): string {
  if (!url) return url;
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "pcqthb-30.myshopify.com";
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
