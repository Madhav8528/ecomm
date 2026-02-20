import type { Metadata } from "next";
import { ProductCatalogLayout } from "@/components/product/product-catalog-layout";
import { getCategoriesSafe, getProductsSafe } from "@/lib/catalog-service";

export const metadata: Metadata = {
  title: "Products",
};

type ProductsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function getCatalogCopy(query: string) {
  const normalized = query.toLowerCase();

  if (normalized.includes("jar")) {
    return {
      title: "Glass Jars",
      description:
        "Explore our premium range of glass jars designed for food storage, gifting, and retail-ready packaging. Our jar collection is built for both visual appeal and durability across industrial and boutique use cases. You can choose from multiple capacities, neck finishes, and shape profiles to match your product line. These jars support custom branding and closure compatibility for smooth bulk production. Ideal for FMCG, cosmetics, spices, dry fruits, and premium gifting requirements.",
    };
  }

  if (normalized.includes("bottle")) {
    return {
      title: "Glass Bottles",
      description:
        "Discover high-clarity glass bottles crafted for beverages, oils, syrups, and specialty products. The range includes functional shapes for efficient filling, labeling, and transport at scale. We offer closure-friendly designs with a focus on leak resistance and consistent quality. Each bottle is suitable for private-label and custom packaging workflows. Built for businesses that require premium shelf presence and reliable supply.",
    };
  }

  if (normalized.includes("cap")) {
    return {
      title: "Cap Closure Options",
      description:
        "Browse closure options engineered for secure sealing, product safety, and premium packaging finish. Our cap solutions support multiple bottle and jar formats for industrial and retail applications. Choose from airtight, tamper-evident, and decorative closure styles depending on product category. Designed for compatibility, consistency, and faster production execution. A practical range for brands scaling across multiple SKUs.",
    };
  }

  if (normalized.includes("custom")) {
    return {
      title: "Customization Solutions",
      description:
        "Create packaging that reflects your brand identity through our customization-ready product range. We support private labeling, logo placements, packaging concepts, and finish preferences for bulk orders. Our process is designed to move from sample approval to production with clear communication. Suitable for startups, established brands, and institutional buyers alike. Build differentiated packaging with a partner focused on consistency and scale.",
    };
  }

  if (normalized.includes("industry")) {
    return {
      title: "Industry Specific Range",
      description:
        "Find specialized glass packaging options tailored for specific industry requirements. From food and beverage to wellness and gifting, each segment has unique capacity and closure needs. Our curated range helps you select products faster with proven compatibility and dependable quality. These selections are suitable for operational scale and retail presentation. Designed to reduce sourcing friction for growing businesses.",
    };
  }

  return {
    title: "All Products",
    description:
      "Browse our complete catalog of glass jars, bottles, closures, and packaging accessories built for modern brands. Every product is selected for quality, compatibility, and long-term usability in bulk supply workflows. Use filters on the left to narrow by category, price range, availability, and bestseller tags. Sort results based on price to quickly find the right match for your requirement. This page is designed for fast discovery and business-ready ordering decisions.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const [categories, products] = await Promise.all([
    getCategoriesSafe(),
    getProductsSafe({ query: query || undefined }),
  ]);
  const copy = getCatalogCopy(query);

  return <ProductCatalogLayout title={copy.title} description={copy.description} products={products} categories={categories} />;
}
