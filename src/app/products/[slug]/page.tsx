import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductQualityPanel } from "@/components/product/product-quality-panel";
import { getProductBySlugSafe, getRelatedProductsSafe } from "@/lib/catalog-service";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugSafe(slug);
  if (!product) {
    return { title: "Product Not Found" };
  }
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: product.seoKeywords?.join(", "),
  };
}

export function generateStaticParams() {
  return [];
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlugSafe(slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductsSafe(product.id, product.categorySlug, 4);
  const inStock = product.stock > 0;
  const specs = product.specs ?? {
    capacity: "250 ml",
    height: "11.5 cm",
    width: "6.5 cm",
    weight: "210 g",
    color: "Crystal clear",
    shape: "Round",
    neckSize: "63 mm",
  };
  const useCaseCopy =
    product.useCaseCopy ??
    [
      "Perfect for premium food storage, spice blends, and artisanal gifting.",
      "Clean, uniform glass finish supports clean label and private branding.",
      "Works well for retail shelf presence with consistent jar clarity.",
      "Closure-friendly neck makes it ideal for bulk filling lines.",
      "Recommended for FMCG, cosmetics, wellness, and boutique packaging.",
    ];
  const seoKeywords =
    product.seoKeywords ??
    [
      "glass jar",
      "bulk packaging",
      "food grade jar",
      "fmcg container",
      "premium glass bottle",
      "closure compatible",
    ];

  return (
    <>
      <RecentlyViewedTracker product={product} />
      <div className="breadcrumb-wrap">
        <div className="container">
          <nav className="breadcrumb">
            <span>Home</span>
            <span className="crumb-sep">›</span>
            <span>Shop</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">{product.name}</span>
          </nav>
        </div>
      </div>
      <section className="section product-detail-section">
        <div className="container product-detail-layout">
          <div>
            <ProductGallery
              name={product.name}
              images={product.images}
              inStock={inStock}
            />
          </div>

          <aside>
            <ProductPurchasePanel product={product} />
          </aside>
        </div>
      </section>
      <ProductQualityPanel />

      <section className="section">
        <div className="container">
          <article className="card detail-specs">
            <div className="detail-panel-header">
              <span className="detail-panel-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="14" height="14" rx="2" />
                  <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
                </svg>
              </span>
              <h3>Specifications</h3>
            </div>
            <div className="spec-grid-horizontal">
              <div><span className="spec-label">Capacity</span><strong>{specs.capacity}</strong></div>
              <div><span className="spec-label">Height</span><strong>{specs.height}</strong></div>
              <div><span className="spec-label">Width</span><strong>{specs.width}</strong></div>
              <div><span className="spec-label">Weight</span><strong>{specs.weight}</strong></div>
              <div><span className="spec-label">Glass Color</span><strong>{specs.color}</strong></div>
              <div><span className="spec-label">Shape</span><strong>{specs.shape}</strong></div>
              <div><span className="spec-label">Neck Size</span><strong>{specs.neckSize}</strong></div>
            </div>
          </article>

          <div className="detail-bottom-row">
            <article className="card detail-description">
              <div className="detail-panel-header">
                <span className="detail-panel-icon">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 5h12M4 8h12M4 11h8" strokeLinecap="round" />
                  </svg>
                </span>
                <h3>About This Product</h3>
              </div>
              <p className="detail-description-text">{product.description || product.shortDescription}</p>
            </article>

            <article className="card detail-best-fits">
              <div className="detail-panel-header">
                <span className="detail-panel-icon">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M10 3l1.8 5.5H17l-4.6 3.3 1.8 5.5L10 14l-4.2 3.3 1.8-5.5L3 8.5h5.2z" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3>Best Fits</h3>
              </div>
              <ul className="best-fits-list">
                {useCaseCopy.map((line) => (
                  <li key={line} className="best-fits-item">
                    <span className="best-fits-check">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="section">
          <div className="container">
            <div className="section-title-row">
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="grid product-grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
