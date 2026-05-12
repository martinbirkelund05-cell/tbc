"use client";

import { useState } from "react";

const COLOR = "#3D4A2D";

const SECTIONS = [
  {
    category: "ORDERS & SHIPPING",
    items: [
      {
        q: "How long does delivery take?",
        a: "We ship worldwide. Delivery typically takes 7–14 business days depending on your location. Once your order is shipped, you'll receive a tracking number via email.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination and are calculated at checkout.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order has been dispatched, you'll receive a confirmation email with your tracking number. You can also track your order at thebrandcrate.com/support/tracking.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can only be modified or cancelled within 1 hour of being placed. Please contact us immediately at thebrandcrate@gmail.com or via Instagram DM.",
      },
    ],
  },
  {
    category: "RETURNS & EXCHANGES",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with tags attached. Return shipping costs are covered by the customer.",
      },
      {
        q: "How do I start a return?",
        a: "Visit thebrandcrate.com/support/returns, log in to your account, select your order and follow the instructions. Once we receive and inspect the item, your refund will be processed within 5–7 business days.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Yes, exchanges are available within 14 days of delivery. Start the process at thebrandcrate.com/support/returns and select 'Exchange' as your reason.",
      },
    ],
  },
  {
    category: "PAYMENTS",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards, PayPal, Klarna (buy now, pay later) and Apple Pay / Google Pay.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are encrypted and processed securely. We never store your payment details.",
      },
      {
        q: "Can I pay in my local currency?",
        a: "Yes. Prices are automatically displayed in your local currency based on your location.",
      },
    ],
  },
  {
    category: "PRODUCTS",
    items: [
      {
        q: "How do I find my size?",
        a: "Each product page includes a size guide. We generally recommend sizing up if you are between sizes, as our fits tend to run slim.",
      },
      {
        q: "How do I care for my garments?",
        a: "Care instructions are printed on the inside label of each garment. We recommend washing on a cold, gentle cycle and air drying to preserve quality.",
      },
    ],
  },
  {
    category: "CONTACT",
    items: [
      {
        q: "How can I contact you?",
        a: "You can reach us via email at thebrandcrate@gmail.com or through Instagram DM @thebrandcrate. We aim to respond within 24 hours.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-4 text-left"
        style={{ color: COLOR }}
      >
        <span style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif", fontSize: "14px", fontWeight: 500 }}>
          {q}
        </span>
        <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0, marginLeft: "16px" }}>
          {open ? "×" : "+"}
        </span>
      </button>

      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "400px" : "0",
          transition: "max-height 0.28s ease",
        }}
      >
        <p
          style={{
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontSize: "13px",
            lineHeight: 1.8,
            color: COLOR,
            opacity: 0.75,
            paddingBottom: "20px",
          }}
        >
          {a}
        </p>
      </div>

      <div style={{ height: "1px", backgroundColor: "#e0e0d8" }} />
    </div>
  );
}

export default function FaqPage() {
  return (
    <main style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "100px 24px 120px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            color: COLOR,
            marginBottom: "56px",
            letterSpacing: "-0.01em",
          }}
        >
          FAQ
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {SECTIONS.map(({ category, items }) => (
            <div key={category}>
              <p
                style={{
                  fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: COLOR,
                  marginBottom: "4px",
                }}
              >
                {category}
              </p>
              <div style={{ height: "1px", backgroundColor: "#e0e0d8", marginBottom: "0" }} />
              {items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
