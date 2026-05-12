const apiVersion = "2024-01";

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  country?: string
): Promise<T> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  // Debug — visible in Vercel Function logs
  console.log("[shopify] domain:", domain ?? "MISSING");
  console.log("[shopify] token:", accessToken ? `${accessToken.slice(0, 6)}…` : "MISSING");
  console.log("[shopify] endpoint:", endpoint);

  if (!domain || !accessToken) {
    throw new Error(
      `Shopify env vars missing — domain: ${domain ?? "undefined"}, token: ${accessToken ? "set" : "undefined"}`
    );
  }

  const vars = country ? { ...variables, country } : variables;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables: vars }),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
