import type { Metadata } from "next";
import { CategoryCard } from "@/components/category/category-card";
import { getCategoriesSafe } from "@/lib/catalog-service";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await getCategoriesSafe();

  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Categories</h1>
          <p>Browse products by category for faster discovery.</p>
        </div>
      </header>
      <section className="section">
        <div className="container grid category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </>
  );
}
