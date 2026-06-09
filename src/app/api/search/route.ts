import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const country = req.nextUrl.searchParams.get("country") ?? undefined;

  if (q.length < 2) return NextResponse.json([]);

  try {
    const products = await searchProducts(q, 8, country);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
