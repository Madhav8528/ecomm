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
    code: "QC",
    title: "Strict Quality Control",
    description: "Food-safe packaging with multi-point inspection.",
  },
  {
    code: "B2B",
    title: "Bulk Production Ready",
    description: "Designed for wholesale and manufacturing scale.",
  },
  {
    code: "OEM",
    title: "Customization Support",
    description: "Private-label and branding friendly solutions.",
  },
  {
    code: "24H",
    title: "Fast Business Support",
    description: "Quick response team for RFQ and sample requests.",
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
          <div className="qualities-grid">
            {qualityItems.map((item) => (
              <article key={item.title} className="quality-card">
                <span className="quality-icon">{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
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
