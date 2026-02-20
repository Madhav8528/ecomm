import Link from "next/link";
import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="card category-card">
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <Link href={`/categories/${category.slug}`} className="btn">
        Browse {category.name}
      </Link>
    </article>
  );
}

