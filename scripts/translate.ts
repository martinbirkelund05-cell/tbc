import * as fs from "fs";
import * as path from "path";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "2aa642da-b8cd-42ac-a005-5b9768b64a4b:fx";
const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

const LANGUAGES = [
  { code: "de", deepl: "DE" },
  { code: "fr", deepl: "FR" },
  { code: "da", deepl: "DA" },
  { code: "nl", deepl: "NL" },
];

async function translateTexts(texts: string[], targetLang: string): Promise<string[]> {
  const res = await fetch(DEEPL_URL, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      source_lang: "EN",
      target_lang: targetLang,
      preserve_formatting: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL error ${res.status}: ${err}`);
  }
  const data = await res.json() as { translations: { text: string }[] };
  return data.translations.map((t) => t.text);
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string) {
  const keys = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

async function main() {
  const messagesDir = path.join(process.cwd(), "messages");
  const enPath = path.join(messagesDir, "en.json");
  const enData = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const flat = flattenObject(enData);
  const keys = Object.keys(flat);
  const values = Object.values(flat);

  for (const lang of LANGUAGES) {
    console.log(`Translating to ${lang.code} (${lang.deepl})...`);
    try {
      // Translate in batches of 50
      const translated: string[] = [];
      for (let i = 0; i < values.length; i += 50) {
        const batch = values.slice(i, i + 50);
        const results = await translateTexts(batch, lang.deepl);
        translated.push(...results);
      }
      const result: Record<string, unknown> = {};
      keys.forEach((key, idx) => setNestedValue(result, key, translated[idx]));
      const outPath = path.join(messagesDir, `${lang.code}.json`);
      fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  ✓ Written to ${outPath}`);
    } catch (err) {
      console.error(`  ✗ Failed for ${lang.code}:`, err);
    }
  }
}

main();
