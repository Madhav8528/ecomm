"use client";

import { useEffect } from "react";
import type { Product } from "@/types/catalog";
import { addProductToRecentlyViewed } from "@/lib/recently-viewed";

export function RecentlyViewedTracker({ product }: { product: Product }) {
  useEffect(() => {
    addProductToRecentlyViewed(product);
  }, [product]);

  return null;
}

