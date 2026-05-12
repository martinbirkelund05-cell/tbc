"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createCart, addToCart } from "@/lib/queries";
import { fixCheckoutUrl } from "@/lib/utils";

interface Props {
  variantId: string;
  amount: string;
  currencyCode: string;
}

export function ExpressCheckout({ variantId, amount, currencyCode }: Props) {
  const [method, setMethod] = useState<"apple" | "google" | null>(null);
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientRef = useRef<any>(null);
  const variantIdRef = useRef(variantId);

  useEffect(() => {
    variantIdRef.current = variantId;
  }, [variantId]);

  const handleBuyNow = useCallback(async () => {
    setLoading(true);
    try {
      const cart = await createCart();
      const updated = await addToCart(cart.id, variantIdRef.current, 1);
      window.location.href = fixCheckoutUrl(updated.checkoutUrl);
    } catch {
      setLoading(false);
    }
  }, []);

  // Render / re-render Google Pay button when client or handler is ready
  useEffect(() => {
    if (method === "google" && googleClientRef.current && googleButtonRef.current) {
      const button = googleClientRef.current.createButton({
        onClick: handleBuyNow,
        buttonSizeMode: "fill",
        buttonType: "buy",
        buttonLocale: "no",
      });
      googleButtonRef.current.innerHTML = "";
      googleButtonRef.current.appendChild(button);
    }
  }, [method, handleBuyNow]);

  useEffect(() => {
    // 1. Apple Pay
    if (typeof window !== "undefined" && "ApplePaySession" in window) {
      try {
        if ((window as any).ApplePaySession.canMakePayments()) {
          setMethod("apple");
          return;
        }
      } catch {}
    }

    // 2. Google Pay
    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.async = true;
    script.onload = async () => {
      try {
        const client = new (window as any).google.payments.api.PaymentsClient({
          environment: "TEST",
        });
        const res = await client.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX"],
              },
            },
          ],
        });
        if (res.result) {
          googleClientRef.current = client;
          setMethod("google");
        }
      } catch {}
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  if (!method) return null;

  return (
    <div className="mb-6">
      {/* Apple Pay */}
      {method === "apple" && (
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className="apple-pay-btn"
          aria-label="Kjøp med Apple Pay"
        />
      )}

      {/* Google Pay */}
      {method === "google" && (
        <div
          ref={googleButtonRef}
          style={{ width: "100%", minHeight: "48px", borderRadius: 0, overflow: "hidden" }}
        />
      )}
    </div>
  );
}
