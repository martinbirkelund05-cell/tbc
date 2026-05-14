import type { Metadata } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { NavSpacer } from "@/components/NavSpacer";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CookieBanner } from "@/components/CookieBanner";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { GAProvider } from "@/components/GAProvider";
import { getAllCollections, getShopPolicies } from "@/lib/queries";
import type { ShopifyPolicies } from "@/lib/queries";

export const metadata: Metadata = {
  title: "TheBrandCrate",
  description: "New arrivals — premium streetwear",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'de' | 'fr' | 'da' | 'nl')) notFound();

  const messages = await getMessages();

  const emptyPolicies: ShopifyPolicies = { privacyPolicy: null, termsOfService: null, refundPolicy: null, shippingPolicy: null };
  const [collections, policies] = await Promise.all([
    getAllCollections().catch(() => []),
    getShopPolicies().catch(() => emptyPolicies),
  ]);

  return (
    <html lang={locale}>
      <body style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <AnnouncementBar />
            <Navbar collections={collections} policies={policies} />
            <CartDrawer />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <NavSpacer />
              {children}
            </main>
            <Footer policies={policies} />
            <WelcomeModal currentLocale={locale} />
            <NewsletterPopup />
            <CookieBanner />
            <GAProvider gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
