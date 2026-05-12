import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !accessToken) {
    return NextResponse.json({
      ok: false,
      error: "Missing env vars",
      domain: domain ?? "MISSING",
      token: accessToken ? "set" : "MISSING",
    });
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `{
          shop { name }
          products(first: 3) { edges { node { id title handle } } }
          newArrivals: collection(handle: "new-arrivals") {
            title
            products(first: 3) { edges { node { id title } } }
          }
          bestSellers: collection(handle: "best-sellers") {
            title
            products(first: 3) { edges { node { id title } } }
          }
        }`,
      }),
      cache: "no-store",
    });

    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = text; }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      domain,
      endpoint,
      token_prefix: accessToken.slice(0, 6) + "…",
      body: json,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
