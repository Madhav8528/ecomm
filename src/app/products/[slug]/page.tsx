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

          <aside className="card">
            <ProductPurchasePanel product={product} />
          </aside>
        </div>
      </section>
      <ProductQualityPanel />

      <section className="section">
        <div className="container detail-layout">
          <article className="card detail-specs">
            <h3>Specifications</h3>
            <div className="spec-grid">
              <div>
                <span className="spec-label">Capacity</span>
                <strong>{specs.capacity}</strong>
              </div>
              <div>
                <span className="spec-label">Height</span>
                <strong>{specs.height}</strong>
              </div>
              <div>
                <span className="spec-label">Width</span>
                <strong>{specs.width}</strong>
              </div>
              <div>
                <span className="spec-label">Weight</span>
                <strong>{specs.weight}</strong>
              </div>
              <div>
                <span className="spec-label">Glass Color</span>
                <strong>{specs.color}</strong>
              </div>
              <div>
                <span className="spec-label">Shape</span>
                <strong>{specs.shape}</strong>
              </div>
              <div>
                <span className="spec-label">Neck Size</span>
                <strong>{specs.neckSize}</strong>
              </div>
            </div>
          </article>

          <article className="card detail-copy">
            <h3>Best Fits & Keywords</h3>
            <div className="detail-lines">
              {useCaseCopy.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="keyword-note">
              Common search terms include {seoKeywords.join(", ")}.
            </p>
          </article>
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
