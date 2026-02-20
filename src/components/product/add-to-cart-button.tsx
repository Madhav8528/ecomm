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
};

export function AddToCartButton({
  product,
  className,
}: {
  product: AddToCartInput;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      className={className ?? "btn btn-primary"}
      onClick={handleAdd}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}

