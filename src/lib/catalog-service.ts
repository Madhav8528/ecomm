import { BACKEND_API_BASE_URL } from "@/lib/backend-config";
import type { Category, Order, Product } from "@/types/catalog";

type CategoryApi = {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

type ProductApi = {
  id: number;
  name: string;
  slug: string;
  category_name: string;
  category_slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  rating: string;
  review_count: number;
  is_best_seller: boolean;
  is_active: boolean;
  pack_size?: number;
  capacity_ml?: number | string | null;
  closure_size?: number | string | null;
  capacity?: string;
  height?: string;
  width?: string;
  weight?: string;
  color?: string;
  shape?: string;
  neck_size?: string;
  is_tableware?: boolean;
  sub_category?: "tumbler" | "jug" | "wine_glass" | "beer_glass" | "mug" | "shot_glass" | "ice_cups" | "other" | null;
  capacity_display?: string | null;
  packaging_type?: "brown_box" | "gift_box" | "both" | null;
  brown_box_price_per_piece?: string | number | null;
  gift_box_price_per_piece?: string | number | null;
  gift_box_sets_per_box?: number | null;
  gift_box_pcs_per_set?: number | null;
  custom_print_available?: boolean;
  custom_shape_available?: boolean;
  use_case_copy?: string[];
  seo_keywords?: string[];
  images?: { id: number; url: string; is_primary: boolean; sort_order: number }[];
  closures?: {
    id: number;
    name: string;
    price: string | number;
    image?: string;
    size_mm?: number | null;
    specs?: Record<string, string | number>;
  }[];
};

type OrderItemApi = {
  id: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

type OrderApi = {
  id: number;
  order_number: string;
  customer_email: string;
  status:
    | "order_received"
    | "confirmed"
    | "ready_to_dispatch"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total: string;
  created_at: string;
  items: OrderItemApi[];
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const FEATURED_CATEGORY_SLUGS = new Set(["glass-jars", "glass-bottles", "corporate-gifting"]);
const DEFAULT_FEATURES = [
  "Food-safe, BPA-free glass",
  "Export quality tested",
  "Suitable for airtight closures",
];

function toOptionalNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeList<T>(payload: T[] | Paginated<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.results) ? payload.results : [];
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let nextPath: string | null = path;
  let safety = 0;
  const basePath = new URL(BACKEND_API_BASE_URL).pathname.replace(/\/$/, "");

  while (nextPath && safety < 50) {
    safety += 1;
    const payload = await backendRequest<T[] | Paginated<T>>(nextPath);
    if (!payload) break;

    if (Array.isArray(payload)) {
      results.push(...payload);
      break;
    }

    if (Array.isArray(payload.results)) {
      results.push(...payload.results);
    }

    if (payload.next) {
      try {
        const nextUrl = new URL(payload.next, BACKEND_API_BASE_URL);
        let derivedPath = `${nextUrl.pathname}${nextUrl.search}`;
        if (basePath && derivedPath.startsWith(basePath)) {
          derivedPath = derivedPath.slice(basePath.length) || "/";
        }
        if (!derivedPath.startsWith("/")) {
          derivedPath = `/${derivedPath}`;
        }
        nextPath = derivedPath;
      } catch {
        nextPath = null;
      }
    } else {
      nextPath = null;
    }
  }

  return results;
}

async function backendRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const url = `${BACKEND_API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function mapCategory(category: CategoryApi): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    featured: FEATURED_CATEGORY_SLUGS.has(category.slug),
  };
}

function mapProduct(product: ProductApi): Product {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description,
    description: product.description,
    categorySlug: product.category_slug,
    sku: product.sku,
    stock: product.stock,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
    currency: "INR",
    isBestSeller: product.is_best_seller,
    capacityMl: toOptionalNumber(product.capacity_ml),
    closureSize: toOptionalNumber(product.closure_size),
    shape: product.shape || undefined,
    customPrintAvailable: product.custom_print_available,
    customShapeAvailable: product.custom_shape_available,
    rating: Number(product.rating),
    reviewCount: product.review_count,
    features: DEFAULT_FEATURES,
    packSize: product.pack_size,
    isTableware: product.is_tableware,
    subCategory: product.sub_category ?? undefined,
    capacityDisplay: product.capacity_display ?? undefined,
    packagingType: product.packaging_type ?? undefined,
    brownBoxPricePerPiece: toOptionalNumber(product.brown_box_price_per_piece),
    giftBoxPricePerPiece: toOptionalNumber(product.gift_box_price_per_piece),
    giftBoxSetsPerBox: product.gift_box_sets_per_box ?? undefined,
    giftBoxPcsPerSet: product.gift_box_pcs_per_set ?? undefined,
    specs: product.capacity
      ? {
          capacity: product.capacity ?? "",
          height: product.height ?? "",
          width: product.width ?? "",
          weight: product.weight ?? "",
          color: product.color ?? "",
          shape: product.shape ?? "",
          neckSize: product.neck_size ?? "",
        }
      : undefined,
    useCaseCopy: product.use_case_copy,
    seoKeywords: product.seo_keywords,
    closures: product.closures?.map((closure) => ({
      id: String(closure.id),
      name: closure.name,
      price: Number(closure.price),
      image: closure.image,
      sizeMm: closure.size_mm ?? undefined,
      specs: closure.specs ?? undefined,
    })),
    images: product.images?.map((image) => image.url),
  };
}

function mapOrderStatus(status: OrderApi["status"]): Order["status"] {
  return status;
}

export async function getCategoriesSafe(): Promise<Category[]> {
  const payload = await backendRequest<CategoryApi[] | Paginated<CategoryApi>>("/categories/");
  if (!payload) return [];
  const categories = normalizeList(payload).map(mapCategory);
  return categories.length ? categories : [];
}

export async function getProductsSafe(params?: {
  categorySlug?: string;
  query?: string;
  isTableware?: boolean;
  subCategory?: string;
  packagingType?: string;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.categorySlug) searchParams.set("category", params.categorySlug);
  if (params?.query) searchParams.set("q", params.query);
  if (typeof params?.isTableware === "boolean") {
    searchParams.set("is_tableware", params.isTableware ? "true" : "false");
  }
  if (params?.subCategory) searchParams.set("sub_category", params.subCategory);
  if (params?.packagingType) searchParams.set("packaging_type", params.packagingType);
  const queryString = searchParams.toString();
  const path = `/products/${queryString ? `?${queryString}` : ""}`;
  const items = await fetchAllPages<ProductApi>(path);
  if (!items.length) return [];
  const products = items.map(mapProduct);
  return products.length ? products : [];
}

export async function getCategoryBySlugSafe(slug: string): Promise<Category | undefined> {
  const payload = await backendRequest<CategoryApi>(`/categories/${slug}/`);
  return payload ? mapCategory(payload) : undefined;
}

export async function getProductBySlugSafe(slug: string): Promise<Product | undefined> {
  const payload = await backendRequest<ProductApi>(`/products/${slug}/`);
  return payload ? mapProduct(payload) : undefined;
}

export async function getProductsByCategorySafe(categorySlug: string): Promise<Product[]> {
  return getProductsSafe({ categorySlug });
}

export async function getRelatedProductsSafe(
  productId: string,
  categorySlug: string,
  limit = 4,
): Promise<Product[]> {
  const products = await getProductsByCategorySafe(categorySlug);
  return products.filter((product) => product.id !== productId).slice(0, limit);
}

export async function getFeaturedCategoriesSafe(): Promise<Category[]> {
  const categories = await getCategoriesSafe();
  return categories.filter((category) => category.featured);
}

export async function getBestSellersSafe(limit = 8): Promise<Product[]> {
  const products = await getProductsSafe();
  const bestSellerProducts = products.filter((product) => product.isBestSeller);
  return bestSellerProducts.slice(0, limit);
}

export async function getOrdersByEmailSafe(email: string): Promise<Order[]> {
  const payload = await backendRequest<OrderApi[] | Paginated<OrderApi>>(
    `/orders/?email=${encodeURIComponent(email)}`,
  );
  if (!payload) return [];

  const orders = normalizeList(payload).map((order) => ({
    id: order.order_number,
    date: order.created_at,
    status: mapOrderStatus(order.status),
    amount: Number(order.total),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    cancellationReason: (order as { cancellation_reason?: string }).cancellation_reason ?? undefined,
  }));

  return orders.length ? orders : [];
}
