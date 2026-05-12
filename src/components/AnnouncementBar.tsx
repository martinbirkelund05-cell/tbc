"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { formatShippingThreshold } from '@/lib/shipping';

function getCountryCookie(): string {
  if (typeof document === "undefined") return "GB";
  const match = document.cookie.match(/NEXT_COUNTRY=([A-Z]{2})/);
  return match?.[1] ?? "GB";
}

export function AnnouncementBar() {
  const t = useTranslations('announcement');
  const [threshold, setThreshold] = useState("€100");

  useEffect(() => {
    setThreshold(formatShippingThreshold(getCountryCookie()));
  }, []);

  const messages = [
    t('freeShipping', { amount: threshold }),
    t('newArrivals'),
    t('easyReturns'),
    t('secureCheckout'),
  ];

  const text = messages.map((m) => `${m}  •  `).join("").repeat(4);

  return (
    <div className="overflow-hidden py-2.5" style={{ backgroundColor: "#F5EFE6" }}>
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-xs tracking-widest uppercase pr-8" style={{ color: "#1a1a1a" }}>
          {text}
        </span>
        <span className="text-xs tracking-widest uppercase pr-8" style={{ color: "#1a1a1a" }} aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
