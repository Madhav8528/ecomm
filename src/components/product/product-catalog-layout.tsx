"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { Category, Product } from "@/types/catalog";

type ProductCatalogLayoutProps = {
  title: string;
  description: string;
  products: Product[];
  categories: Category[];
};

type PriceBand = "all" | "under500" | "500to1000" | "1000to2000" | "above2000";
type SortBy = "featured" | "priceAsc" | "priceDesc";

export function ProductCatalogLayout({
  title,
  description,
  products,
  categories,
}: ProductCatalogLayoutProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceBand, setPriceBand] = useState<PriceBand>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("featured");

  const categoriesInProducts = useMemo(() => {
    const slugs = new Set(products.map((product) => product.categorySlug));
    return categories.filter((category) => slugs.has(category.slug));
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (selectedCategories.length) {
      next = next.filter((product) => selectedCategories.includes(product.categorySlug));
    }

    if (priceBand !== "all") {
      next = next.filter((product) => {
        if (priceBand === "under500") return product.price < 500;
        if (priceBand === "500to1000") return product.price >= 500 && product.price <= 1000;
        if (priceBand === "1000to2000") return product.price > 1000 && product.price <= 2000;
        return product.price > 2000;
      });
    }

    if (inStockOnly) {
      next = next.filter((product) => product.stock > 0);
    }

    if (bestSellerOnly) {
      next = next.filter((product) => product.isBestSeller);
    }

    if (sortBy === "priceAsc") {
      next.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      next.sort((a, b) => b.price - a.price);
    }

    return next;
  }, [bestSellerOnly, inStockOnly, priceBand, products, selectedCategories, sortBy]);

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setPriceBand("all");
    setInStockOnly(false);
    setBestSellerOnly(false);
    setSortBy("featured");
  }

  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <section className="section">
        <div className="container catalog-layout">
          <aside className="card filter-panel">
            <div className="filter-title-row">
              <h3>Filters</h3>
              <button type="button" className="btn filter-clear-btn" onClick={clearFilters}>
                Clear
              </button>
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {categoriesInProducts.map((category) => (
                  <label key={category.id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => toggleCategory(category.slug)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceBand"
                    checked={priceBand === "all"}
                    onChange={() => setPriceBand("all")}
                  />
                  <span>All Prices</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceBand"
                    checked={priceBand === "under500"}
                    onChange={() => setPriceBand("under500")}
                  />
                  <span>Under Rs 500</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceBand"
                    checked={priceBand === "500to1000"}
                    onChange={() => setPriceBand("500to1000")}
                  />
                  <span>Rs 500 - Rs 1000</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceBand"
                    checked={priceBand === "1000to2000"}
                    onChange={() => setPriceBand("1000to2000")}
                  />
                  <span>Rs 1000 - Rs 2000</span>
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="priceBand"
                    checked={priceBand === "above2000"}
                    onChange={() => setPriceBand("above2000")}
                  />
                  <span>Above Rs 2000</span>
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h4>Availability</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly((prev) => !prev)}
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={bestSellerOnly}
                    onChange={() => setBestSellerOnly((prev) => !prev)}
                  />
                  <span>Best Sellers</span>
                </label>
              </div>
            </div>
          </aside>

          <div className="catalog-results">
            <div className="catalog-results-toolbar">
              <p className="muted">
                Showing <strong>{filteredProducts.length}</strong> product(s)
              </p>
              <div className="catalog-sort">
                <label htmlFor="sortBy">Sort by</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortBy)}
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length ? (
              <div className="grid product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="card empty-state">
                <h3>No products match these filters</h3>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
