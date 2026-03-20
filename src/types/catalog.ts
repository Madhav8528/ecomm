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
  rating: number;
  reviewCount: number;
  features: string[];
  packSize?: number;
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
  status: "Processing" | "Shipped" | "Delivered";
  amount: number;
  itemCount: number;
};
