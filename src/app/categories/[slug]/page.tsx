import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import {
  getCategoryBySlugSafe,
  getProductsByCategorySafe,
} from "@/lib/catalog-service";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugSafe(slug);
  if (!category) {
    return { title: "Category Not Found" };
  }
  return {
    title: category.name,
    description: category.description,
  };
}

export function generateStaticParams() {
  return [];
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlugSafe(slug);
  if (!category) {
    notFound();
  }

  const categoryProducts = await getProductsByCategorySafe(slug);

  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          {categoryProducts.length ? (
            <div className="grid product-grid">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card empty-state">
              <h3>No products found in this category.</h3>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
