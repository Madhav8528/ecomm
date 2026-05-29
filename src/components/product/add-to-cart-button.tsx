"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";

type AddToCartInput = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  price: number;
  maxStock?: number;
};

export function AddToCartButton({
  product,
  className,
}: {
  product: AddToCartInput;
  className?: string;
}) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [stockError, setStockError] = useState("");

  function handleAdd() {
    if (typeof product.maxStock === "number") {
      const existingQty = items.find((item) => item.id === product.id)?.quantity ?? 0;
      if (existingQty >= product.maxStock) {
        setStockError(`Only ${product.maxStock} units are available for this item.`);
        return;
      }
    }

    setStockError("");
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <button type="button" className={className ?? "btn btn-primary"} onClick={handleAdd}>
        {added ? "Added" : "Add to Cart"}
      </button>
      {stockError ? <span className="form-error">{stockError}</span> : null}
    </>
  );
}
