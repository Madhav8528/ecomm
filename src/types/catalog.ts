export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  sku: string;
  stock: number;
  price: number;
  compareAtPrice?: number;
  currency: "INR";
  isBestSeller: boolean;
  capacityMl?: number;
  closureSize?: number;
  shape?: string;
  customPrintAvailable?: boolean;
  customShapeAvailable?: boolean;
  rating: number;
  reviewCount: number;
  features: string[];
  packSize?: number;
  isTableware?: boolean;
  subCategory?: "tumbler" | "jug" | "wine_glass" | "beer_glass" | "mug" | "shot_glass" | "ice_cups" | "other";
  capacityDisplay?: string;
  packagingType?: "brown_box" | "gift_box" | "both";
  brownBoxPricePerPiece?: number;
  giftBoxPricePerPiece?: number;
  giftBoxSetsPerBox?: number;
  giftBoxPcsPerSet?: number;
  closures?: {
    id: string;
    name: string;
    price: number;
    image?: string;
    sizeMm?: number;
    specs?: Record<string, string | number>;
  }[];
  images?: string[];
  specs?: {
    capacity: string;
    height: string;
    width: string;
    weight: string;
    color: string;
    shape: string;
    neckSize: string;
  };
  useCaseCopy?: string[];
  seoKeywords?: string[];
};

export type Order = {
  id: string;
  date: string;
  status:
    | "order_received"
    | "confirmed"
    | "ready_to_dispatch"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  amount: number;
  itemCount: number;
  cancellationReason?: string;
};
