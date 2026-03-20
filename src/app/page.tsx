import Link from "next/link";
import Image from "next/image";
import { HomeSlider } from "@/components/home/home-slider";
import { RecentlyViewedSection } from "@/components/home/recently-viewed-section";
import { ProductCard } from "@/components/product/product-card";
import {
  getBestSellersSafe,
  getFeaturedCategoriesSafe,
  getProductsSafe,
} from "@/lib/catalog-service";

const qualityItems = [
  {
    title: "4+ Decades of Trust",
    description: "Since 1996",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M5 9l7-4 7 4v6c0 3.8-3 6.4-7 7-4-0.6-7-3.2-7-7V9z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Quality Assured Glass",
    description: "Food-Safe & Export Ready",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M8 3h8l-1.2 4.2c-0.2 0.7-0.4 1.4-0.4 2.2v6.2a4 4 0 1 1-4.8 0V9.4c0-0.8-0.2-1.5-0.4-2.2L8 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 13h6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Bulk Supply Strength",
    description: "Wholesale & OEM",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M4 8h8l-2 4h-6l2-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 8h8l-2 4h-8l2-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M6 12v7h6v-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 12v7h6v-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Quick Turnaround",
    description: "Sampling to Dispatch",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 7v5l3 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Customization Ready",
    description: "Branding & Decoration",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M4 18l4.5-1 9.5-9.5-3.5-3.5L5 13.5 4 18z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 5.5l3.5 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Complete Glass Solutions",
    description: "From One Source",
    icon: (
      <svg viewBox="0 0 24 24" role="presentation" focusable="false">
        <path
          d="M3.5 8l8.5-4 8.5 4-8.5 4-8.5-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 12l8.5 4 8.5-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 16l8.5 4 8.5-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const shopByProduct = [
  {
    title: "Glass Jars",
    href: "/products?q=jar",
    image: "/categories/glass-jars.svg",
  },
  {
    title: "Glass Bottles",
    href: "/products?q=bottle",
    image: "/categories/glass-bottles.svg",
  },
  {
    title: "Cap Closures",
    href: "/products?q=cap",
    image: "/categories/cap-closures.svg",
  },
  {
    title: "Corporate Gifting Jars",
    href: "/products?q=gift",
    image: "/categories/corporate-gifting.svg",
  },
];

const trustedBrands = [
  "FreshNest Foods",
  "Aurum Wellness",
  "GreenRoot Organics",
  "Urban Pantry",
  "Bloom Beverages",
  "NutriHarvest",
  "Royal Preserves",
  "Craft & Co.",
];

export default async function Home() {
  const [featuredCategories, bestSellers, allProducts] = await Promise.all([
    getFeaturedCategoriesSafe(),
    getBestSellersSafe(8),
    getProductsSafe(),
  ]);

  const jarProducts = allProducts
    .filter((product) => product.name.toLowerCase().includes("jar"))
    .slice(0, 8);
  const corporateGiftingProducts = jarProducts.length ? jarProducts : bestSellers.slice(0, 8);

  return (
    <>
      <HomeSlider />

      <section className="section">
        <div className="container">
          <div className="quality-line">
            {qualityItems.map((item) => (
              <div key={item.title} className="quality-item">
                <span className="quality-icon">{item.icon}</span>
                <span className="quality-title">{item.title}</span>
                <span className="quality-sub">{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="shop-by-product">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Shop By Product</h2>
            <Link href="/products" className="section-note">
              View full catalog
            </Link>
          </div>
          <div className="shop-category-grid">
            {shopByProduct.map((item) => (
              <Link href={item.href} key={item.title} className="shop-category-card">
                <div className="shop-category-image">
                  <Image src={item.image} alt={item.title} fill sizes="260px" />
                </div>
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="corporate-gifting-jars">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Corporate Gifting Jars</h2>
            <Link href="/products?q=gift" className="section-note">
              See all
            </Link>
          </div>
          <div className="grid product-grid">
            {corporateGiftingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="trusted-brands">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Brands Who Trust Us</h2>
          </div>
          <div className="trusted-brands-grid">
            {trustedBrands.map((brand) => (
              <article key={brand} className="trusted-brand-card">
                <span>{brand}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Featured Picks</h2>
            <Link href="/categories" className="section-note">
              Browse categories
            </Link>
          </div>
          <div className="grid product-grid">
            {bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {featuredCategories.slice(0, 2).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="card feature-category-callout"
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span>Explore Category</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewedSection products={allProducts} />
    </>
  );
}
