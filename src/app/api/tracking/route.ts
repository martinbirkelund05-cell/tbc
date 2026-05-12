import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.aftership.com/tracking/2024-07";

function headers() {
  return {
    "aftership-api-key": process.env.AFTERSHIP_API_KEY!,
    "Content-Type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();
  if (!trackingNumber?.trim()) {
    return NextResponse.json({ error: "missing_number" }, { status: 400 });
  }

  const num = trackingNumber.trim();

  // First: search existing trackings
  const listRes = await fetch(
    `${BASE}/trackings?tracking_numbers=${encodeURIComponent(num)}&limit=1`,
    { headers: headers() }
  );
  if (listRes.ok) {
    const listData = await listRes.json();
    const existing = listData.data?.trackings?.[0];
    if (existing) {
      return NextResponse.json({ tracking: existing });
    }
  }

  // Not found: create/detect
  const createRes = await fetch(`${BASE}/trackings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ tracking: { tracking_number: num } }),
  });

  if (createRes.status === 409) {
    // Already exists but wasn't in list — retry list
    const retryRes = await fetch(
      `${BASE}/trackings?tracking_numbers=${encodeURIComponent(num)}&limit=1`,
      { headers: headers() }
    );
    if (retryRes.ok) {
      const retryData = await retryRes.json();
      const t = retryData.data?.trackings?.[0];
      if (t) return NextResponse.json({ tracking: t });
    }
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!createRes.ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const createData = await createRes.json();
  const tracking = createData.data?.tracking;
  if (!tracking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ tracking });
}
