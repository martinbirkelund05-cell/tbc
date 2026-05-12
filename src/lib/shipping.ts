type CurrencyConfig = { symbol: string; amount: number; after?: boolean };

export const COUNTRY_CURRENCY: Record<string, CurrencyConfig> = {
  AU: { symbol: "A$", amount: 165 },
  AT: { symbol: "€", amount: 100 },
  BE: { symbol: "€", amount: 100 },
  CA: { symbol: "CA$", amount: 140 },
  DK: { symbol: "kr", amount: 750, after: true },
  FI: { symbol: "€", amount: 100 },
  FR: { symbol: "€", amount: 100 },
  DE: { symbol: "€", amount: 100 },
  IS: { symbol: "kr", amount: 15000, after: true },
  IE: { symbol: "€", amount: 100 },
  IT: { symbol: "€", amount: 100 },
  LU: { symbol: "€", amount: 100 },
  NL: { symbol: "€", amount: 100 },
  NO: { symbol: "kr", amount: 1150, after: true },
  PL: { symbol: "zł", amount: 430, after: true },
  PT: { symbol: "€", amount: 100 },
  ES: { symbol: "€", amount: 100 },
  SE: { symbol: "kr", amount: 1150, after: true },
  CH: { symbol: "CHF", amount: 95, after: true },
  GB: { symbol: "£", amount: 85 },
  US: { symbol: "$", amount: 110 },
};

export function formatShippingThreshold(countryCode: string): string {
  const cfg = COUNTRY_CURRENCY[countryCode] ?? { symbol: "€", amount: 100 };
  const amount = cfg.amount.toLocaleString("en");
  return cfg.after ? `${amount} ${cfg.symbol}` : `${cfg.symbol}${amount}`;
}

export const CURRENCY_THRESHOLDS: Record<string, number> = {
  EUR: 100, GBP: 85, USD: 110, CAD: 140, AUD: 165,
  NOK: 1150, SEK: 1150, DKK: 750, CHF: 95, ISK: 15000, PLN: 430,
};
