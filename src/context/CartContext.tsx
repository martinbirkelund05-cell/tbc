"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { ShopifyCart } from "@/types/shopify";
import { createCart, getCart, addToCart, updateCartLine, removeFromCart } from "@/lib/queries";

interface CartContextValue {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number, silent?: boolean) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function getCountryCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/NEXT_COUNTRY=([A-Z]{2})/);
  return match?.[1];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getOrCreateCart = useCallback(async (): Promise<ShopifyCart> => {
    const country = getCountryCookie();
    const storedId = localStorage.getItem("shopify_cart_id");
    const storedCountry = localStorage.getItem("shopify_cart_country");

    // If country changed since cart was created, discard the old cart
    if (storedId && storedCountry !== (country ?? "")) {
      localStorage.removeItem("shopify_cart_id");
      localStorage.removeItem("shopify_cart_country");
    } else if (storedId) {
      const existing = await getCart(storedId, country);
      if (existing) {
        setCart(existing);
        return existing;
      }
    }

    const fresh = await createCart(country);
    localStorage.setItem("shopify_cart_id", fresh.id);
    localStorage.setItem("shopify_cart_country", country ?? "");
    setCart(fresh);
    return fresh;
  }, []);

  useEffect(() => {
    getOrCreateCart();
  }, [getOrCreateCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1, silent = false) => {
      setIsLoading(true);
      try {
        const country = getCountryCookie();
        const current = cart ?? (await getOrCreateCart());
        const updated = await addToCart(current.id, variantId, quantity, country);
        setCart(updated);
        if (!silent) setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [cart, getOrCreateCart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setIsLoading(true);
      try {
        const updated = await updateCartLine(cart.id, lineId, quantity, getCountryCookie());
        setCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setIsLoading(true);
      try {
        const updated = await removeFromCart(cart.id, lineId, getCountryCookie());
        setCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
