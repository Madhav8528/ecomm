import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const coverImage = product.images?.[0];
  const showOffer = Boolean(product.compareAtPrice || product.isBestSeller);
  return (
    <article className="card product-card">
      <div className="product-thumb-wrap">
        {showOffer ? <span className="product-offer-badge">Special Offer!</span> : null}
        <Link href={`/products/${product.slug}`} className="product-thumb">
          {coverImage ? <img src={coverImage} alt={product.name} /> : <span>{product.name}</span>}
        </Link>
        <div className="product-info-overlay" aria-hidden>
          <span className="product-name">{product.name}</span>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </div>
      </div>
      <Link href={`/products/${product.slug}`} className="btn product-buy-btn">
        <span className="btn-icon" aria-hidden>
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
        Buy Now
      </Link>
    </article>
  );
}
