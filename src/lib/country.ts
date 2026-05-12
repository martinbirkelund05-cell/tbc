import { cookies } from "next/headers";

export async function getCountryCode(): Promise<string | undefined> {
  const store = await cookies();
  const raw = store.get("NEXT_COUNTRY")?.value;
  // Validate it's a 2-letter ISO code we recognise
  if (raw && /^[A-Z]{2}$/.test(raw)) return raw;
  return undefined;
}
