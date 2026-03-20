"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

export function CartLink() {
  const { totalItems } = useCart();
  return (
    <Link href="/cart" className="nav-link nav-link-cart">
      <span className="nav-text-icon" aria-hidden>
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path
            d="M3 5h2l2.3 10.5h10.5l2-7.5H7.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="19" r="1.4" fill="currentColor" />
          <circle cx="17" cy="19" r="1.4" fill="currentColor" />
        </svg>
      </span>
      Cart ({totalItems})
    </Link>
  );
}
