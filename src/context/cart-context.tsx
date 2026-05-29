"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "clearpiece-cart-v1";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  price: number;
  priceUnit?: "per_piece" | "per_set";
  setSize?: number;
  quantity: number;
  packagingMode?: "brown_box" | "gift_box";
  maxStock?: number;
  packSize?: number;
  parentId?: string;
  image?: string;
};

type AddItemInput = Omit<CartLine, "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartLine[];
  isHydrated: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: AddItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function normalizeMaxStock(...candidates: Array<number | undefined>) {
  const values = candidates
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .map((value) => Math.max(0, Math.floor(value)));
  if (!values.length) return undefined;
  return Math.min(...values);
}

function clampQuantityByStock(quantity: number, maxStock?: number) {
  const normalizedQuantity = Math.max(0, Math.floor(quantity));
  if (typeof maxStock !== "number") return normalizedQuantity;
  return Math.min(normalizedQuantity, maxStock);
}

function getLineTotal(item: CartLine) {
  if (item.priceUnit === "per_set") {
    const setSize = Math.max(1, item.setSize ?? 6);
    return (item.price * item.quantity) / setSize;
  }
  return item.price * item.quantity;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartLine[];
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getLineTotal(item), 0),
    [items],
  );

  function addItem(item: AddItemInput) {
    const qty = Math.max(1, item.quantity ?? 1);
    setItems((prev) => {
      const existing = prev.find((line) => line.id === item.id);
      const maxStock = normalizeMaxStock(existing?.maxStock, item.maxStock);
      if (existing) {
        const quantity = clampQuantityByStock(existing.quantity + qty, maxStock);
        if (quantity <= 0) {
          return prev.filter((line) => line.id !== item.id);
        }
        return prev.map((line) =>
          line.id === item.id
            ? { ...line, quantity, maxStock, price: item.price, priceUnit: item.priceUnit, setSize: item.setSize, packagingMode: item.packagingMode }
            : line,
        );
      }
      const quantity = clampQuantityByStock(qty, maxStock);
      if (quantity <= 0) return prev;
      return [...prev, { ...item, quantity, maxStock }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((line) => line.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((prev) => {
      const line = prev.find((entry) => entry.id === id);
      if (!line) return prev;
      const safeQuantity = clampQuantityByStock(quantity, line.maxStock);
      if (safeQuantity <= 0) {
        return prev.filter((entry) => entry.id !== id);
      }
      return prev.map((entry) => (entry.id === id ? { ...entry, quantity: safeQuantity } : entry));
    });
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
