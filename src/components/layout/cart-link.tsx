"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

export function CartLink() {
  const { totalItems } = useCart();
  return (
    <Link href="/cart" className="nav-link">
      Cart ({totalItems})
    </Link>
  );
}

