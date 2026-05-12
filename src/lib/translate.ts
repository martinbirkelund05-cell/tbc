import { unstable_cache } from "next/cache";

const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";
const DEEPL_KEY = process.env.DEEPL_API_KEY ?? "";

const LOCALE_TO_DEEPL: Record<string, string> = {
  de: "DE",
  fr: "FR",
  da: "DA",
  nl: "NL",
};

async function translateText(text: string, targetLocale: string): Promise<string> {
  const targetLang = LOCALE_TO_DEEPL[targetLocale];
  if (!targetLang || !text.trim() || !DEEPL_KEY) return text;

  const res = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang,
      source_lang: "EN",
      tag_handling: "html",
    }),
  });

  if (!res.ok) return text;
  const data = await res.json();
  return data.translations?.[0]?.text ?? text;
}

export const translateDescription = unstable_cache(
  async (text: string, locale: string) => translateText(text, locale),
  ["product-description-translation"],
  { revalidate: 60 * 60 * 24 * 30 }
);
