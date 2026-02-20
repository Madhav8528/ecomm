import type { Product } from "@/types/catalog";

export const RECENTLY_VIEWED_COOKIE = "guru_recently_viewed";
const MAX_RECENT_ITEMS = 10;

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  categorySlug: string;
};

function parseCookieValue(value: string): RecentlyViewedItem[] {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as RecentlyViewedItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        Boolean(item.id) &&
        Boolean(item.slug) &&
        Boolean(item.name) &&
        typeof item.price === "number",
    );
  } catch {
    return [];
  }
}

export function getRecentlyViewedFromDocument(): RecentlyViewedItem[] {
  if (typeof document === "undefined") return [];
  const cookieEntry = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${RECENTLY_VIEWED_COOKIE}=`));

  if (!cookieEntry) return [];
  const value = cookieEntry.split("=")[1] ?? "";
  return parseCookieValue(value);
}

export function saveRecentlyViewedToCookie(items: RecentlyViewedItem[]) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(JSON.stringify(items.slice(0, MAX_RECENT_ITEMS)));
  document.cookie = `${RECENTLY_VIEWED_COOKIE}=${encoded};path=/;max-age=2592000;samesite=lax`;
}

export function addProductToRecentlyViewed(product: Product) {
  const current = getRecentlyViewedFromDocument();
  const next: RecentlyViewedItem[] = [
    {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      categorySlug: product.categorySlug,
    },
    ...current.filter((item) => item.id !== product.id),
  ].slice(0, MAX_RECENT_ITEMS);
  saveRecentlyViewedToCookie(next);
}

