const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

const LOCALE_TO_DEEPL: Record<string, string> = {
  de: "DE",
  fr: "FR",
  da: "DA",
  nl: "NL",
};

export async function translateDescription(text: string, locale: string): Promise<string> {
  try {
    const DEEPL_KEY = process.env.DEEPL_API_KEY;
    const targetLang = LOCALE_TO_DEEPL[locale];
    if (!targetLang || !text?.trim() || !DEEPL_KEY) return text;

    const res = await fetch(DEEPL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
        source_lang: "EN",
        tag_handling: "html",
      }),
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) return text;
    const data = await res.json();
    return data.translations?.[0]?.text ?? text;
  } catch {
    return text;
  }
}
