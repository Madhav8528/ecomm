import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const coverImage = product.images?.[0];
  return (
    <article className="card product-card">
      <Link href={`/products/${product.slug}`} className="product-thumb">
        {coverImage ? <img src={coverImage} alt={product.name} /> : <span>{product.name}</span>}
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <span className="badge">{product.categorySlug.replace("-", " ")}</span>
      </div>
      <Link href={`/products/${product.slug}`} className="product-name">
        {product.name}
      </Link>
      <p className="muted">{product.shortDescription}</p>
      <div className="price-row">
        <span className="price">{formatCurrency(product.price)}</span>
        {product.compareAtPrice ? (
          <span className="price-cut">{formatCurrency(product.compareAtPrice)}</span>
        ) : null}
      </div>
      <Link href={`/products/${product.slug}`} className="btn btn-primary">
        Buy Now
      </Link>
    </article>
  );
}
