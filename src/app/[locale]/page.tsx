import Link from "next/link";
import { getProductsByCollection } from "@/lib/queries";
import { getCountryCode } from "@/lib/country";
import { ProductCard } from "@/components/ProductCard";
import { EditorialHeroPair } from "@/components/EditorialHeroPair";
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('hero');
  const tc = await getTranslations('collection');
  const country = await getCountryCode();

  const [newArrivals, bestSellers] = await Promise.all([
    getProductsByCollection("new-arrivals", 6, country).catch(() => []),
    getProductsByCollection("best-sellers", 6, country).catch(() => []),
  ]);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-10"
        style={{ minHeight: "100vh" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />

        {/* Sticky content — follows viewport down through the hero, stops 20px above image bottom */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-6"
          style={{ position: "sticky", top: "calc(50vh - 80px)", paddingBottom: "20px" }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
            {t('season')}
          </p>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-3"
            style={{ color: "#ffffff" }}
          >
            {t('newArrivals')}
          </h1>
          <a
            href="#new-arrivals"
            className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase border px-5 py-2 transition-all hover:opacity-70"
            style={{ borderColor: "#ffffff", color: "#ffffff", borderRadius: "9999px" }}
          >
            {t('shopNow')}
          </a>
        </div>
      </section>

      {/* Section 1 — New Arrivals */}
      <section id="new-arrivals" className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: "8px", padding: "8px" }}>
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center py-3">
          <Link
            href="/collections/new-arrivals"
            className="text-[12px] underline underline-offset-4"
            style={{ color: "var(--brand)" }}
          >
            {tc('viewAll')}
          </Link>
        </div>
      </section>

      <EditorialHeroPair />

      {/* Section 2 — Best Sellers */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 mt-4">
        <div className="px-4 sm:px-6 mb-4">
          <h2
            className="text-[13px] font-bold"
            style={{ color: "var(--brand)" }}
          >
            {t('newArrivals')}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gap: "8px", padding: "8px" }}>
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center py-3">
          <Link
            href="/collections/best-sellers"
            className="text-[12px] underline underline-offset-4"
            style={{ color: "var(--brand)" }}
          >
            {tc('viewAll')}
          </Link>
        </div>
      </section>
    </div>
  );
}
