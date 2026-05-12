import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr', 'da', 'nl'],
  defaultLocale: 'en',
  // Disable Accept-Language header detection — WelcomeModal handles IP-based
  // language selection for first-time visitors. Returning visitors use the
  // NEXT_LOCALE cookie set when they confirmed their preference.
  localeDetection: false,
});
