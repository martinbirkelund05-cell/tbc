const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const apiVersion = "2024-01";

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
