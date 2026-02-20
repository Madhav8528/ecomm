"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import {
  getRecentlyViewedFromDocument,
  type RecentlyViewedItem,
} from "@/lib/recently-viewed";
import type { Product } from "@/types/catalog";

export function RecentlyViewedSection({ products }: { products: Product[] }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewedFromDocument());
  }, []);

  const mappedProducts = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return items
      .map((item) => byId.get(item.id))
      .filter((product): product is Product => Boolean(product));
  }, [items, products]);

  if (!mappedProducts.length) {
    return null;
  }

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-title-row">
          <h2 className="section-title">Recently Viewed</h2>
          <p className="section-note">Based on your latest product visits</p>
        </div>
        <div className="grid product-grid">
          {mappedProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
