"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { Category, Product } from "@/types/catalog";

type ProductCatalogLayoutProps = {
  title: string;
  description: string;
  products: Product[];
  categories: Category[];
  mode?: "default" | "tableware";
};

type SortBy = "featured" | "priceAsc" | "priceDesc";
type ProductTypeFilter = "glassBottles" | "glassJars" | "capClosures";
type CapacityFilter = "upTo100" | "101to250" | "251to500" | "501to1000" | "above1L";
type ClosureSizeFilter = 28 | 38 | 43 | 63 | 70 | 82;
type ShapeFilter = "round" | "squareMarasca" | "hexagonal" | "oval" | "flintFlared";
type AvailabilityFilter = "inStockOnly" | "bestSellers";
type CustomizationFilter = "customPrintAvailable" | "customShapeAvailable";
type TablewareTypeFilter = "tumbler" | "jug" | "wine_glass" | "beer_glass" | "mug" | "shot_glass" | "ice_cups" | "other";
type TablewareCapacityFilter = "under200" | "200to500" | "500plus" | "1lplus";
type TablewarePackagingFilter = "brown_box" | "gift_box";
type TablewareGlassColorFilter = "clear" | "frosted" | "colored";

const PRODUCT_TYPE_OPTIONS: { value: ProductTypeFilter; label: string }[] = [
  { value: "glassBottles", label: "Glass Bottles" },
  { value: "glassJars", label: "Glass Jars" },
  { value: "capClosures", label: "Cap / Closures" },
];

const CAPACITY_OPTIONS: { value: CapacityFilter; label: string }[] = [
  { value: "upTo100", label: "Up to 100 ml" },
  { value: "101to250", label: "101-250 ml" },
  { value: "251to500", label: "251-500 ml" },
  { value: "501to1000", label: "501-1000 ml" },
  { value: "above1L", label: "Above 1 L" },
];

const CLOSURE_SIZE_OPTIONS: { value: ClosureSizeFilter; label: string }[] = [
  { value: 28, label: "28 mm" },
  { value: 38, label: "38 mm" },
  { value: 43, label: "43 mm" },
  { value: 63, label: "63 mm" },
  { value: 70, label: "70 mm" },
  { value: 82, label: "82 mm" },
];

const SHAPE_OPTIONS: { value: ShapeFilter; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "squareMarasca", label: "Square / Marasca" },
  { value: "hexagonal", label: "Hexagonal" },
  { value: "oval", label: "Oval" },
  { value: "flintFlared", label: "Flint / Flared" },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: "inStockOnly", label: "In Stock Only" },
  { value: "bestSellers", label: "Best Sellers" },
];

const CUSTOMIZATION_OPTIONS: { value: CustomizationFilter; label: string }[] = [
  { value: "customPrintAvailable", label: "Custom Print Available" },
  { value: "customShapeAvailable", label: "Custom Shape Available" },
];

const TABLEWARE_TYPE_OPTIONS: { value: TablewareTypeFilter; label: string }[] = [
  { value: "tumbler", label: "Tumbler" },
  { value: "jug", label: "Jug / Pitcher" },
  { value: "wine_glass", label: "Wine Glass" },
  { value: "beer_glass", label: "Beer Glass" },
  { value: "mug", label: "Mug" },
  { value: "shot_glass", label: "Shot Glass" },
  { value: "ice_cups", label: "Ice Cups" },
  { value: "other", label: "Other" },
];

const TABLEWARE_CAPACITY_OPTIONS: { value: TablewareCapacityFilter; label: string }[] = [
  { value: "under200", label: "Under 200 ml" },
  { value: "200to500", label: "200-500 ml" },
  { value: "500plus", label: "500 ml+" },
  { value: "1lplus", label: "1 L+" },
];

const TABLEWARE_PACKAGING_OPTIONS: { value: TablewarePackagingFilter; label: string }[] = [
  { value: "brown_box", label: "Brown Box" },
  { value: "gift_box", label: "Gift Box Set" },
];

const TABLEWARE_GLASS_COLOR_OPTIONS: { value: TablewareGlassColorFilter; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "frosted", label: "Frosted" },
  { value: "colored", label: "Colored" },
];

function toggleSelection<T extends string | number>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseNumber(value: string | number | null | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseCapacityMlFromText(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const normalized = normalizeText(value);
  const mlMatch = normalized.match(/(\d+(?:\.\d+)?)\s*ml\b/);
  if (mlMatch) return Number(mlMatch[1]);

  const literMatch = normalized.match(/(\d+(?:\.\d+)?)\s*l\b/);
  if (literMatch) return Number(literMatch[1]) * 1000;

  const gramMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(g|gm|gram)\b/);
  if (gramMatch) return Number(gramMatch[1]);

  return parseNumber(value);
}

function getCapacityMl(product: Product): number | undefined {
  if (typeof product.capacityMl === "number" && Number.isFinite(product.capacityMl)) {
    return product.capacityMl;
  }
  if (product.capacityDisplay) {
    const fromDisplay = parseCapacityMlFromText(product.capacityDisplay);
    if (fromDisplay !== undefined) return fromDisplay;
  }
  return parseCapacityMlFromText(product.specs?.capacity);
}

function isCapacityInRange(value: number, range: CapacityFilter): boolean {
  if (range === "upTo100") return value <= 100;
  if (range === "101to250") return value >= 101 && value <= 250;
  if (range === "251to500") return value >= 251 && value <= 500;
  if (range === "501to1000") return value >= 501 && value <= 1000;
  return value > 1000;
}

function parseMmValues(text: string | undefined): number[] {
  if (!text) return [];
  const matches = text.matchAll(/(\d+(?:\.\d+)?)\s*mm\b/gi);
  const values = Array.from(matches)
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.round(value));
  return values;
}

function getProductClosureSizes(product: Product): number[] {
  const sizes = new Set<number>();

  if (typeof product.closureSize === "number" && Number.isFinite(product.closureSize)) {
    sizes.add(Math.round(product.closureSize));
  }

  const parsedNeckSize = parseMmValues(product.specs?.neckSize);
  for (const size of parsedNeckSize) sizes.add(size);

  const parsedFromName = parseMmValues(product.name);
  for (const size of parsedFromName) sizes.add(size);

  for (const closure of product.closures ?? []) {
    if (typeof closure.sizeMm === "number" && Number.isFinite(closure.sizeMm)) {
      sizes.add(Math.round(closure.sizeMm));
      continue;
    }
    const parsedSize = parseNumber(closure.name);
    if (typeof parsedSize === "number") sizes.add(Math.round(parsedSize));
  }

  return Array.from(sizes);
}

function matchesShapeOption(product: Product, shape: ShapeFilter): boolean {
  const shapeText = normalizeText(product.shape || product.specs?.shape || product.name);
  if (!shapeText) return false;
  if (shape === "round") return shapeText.includes("round");
  if (shape === "squareMarasca") return shapeText.includes("square") || shapeText.includes("marasca");
  if (shape === "hexagonal") return shapeText.includes("hex");
  if (shape === "oval") return shapeText.includes("oval");
  return shapeText.includes("flint") || shapeText.includes("flared") || shapeText.includes("flare");
}

function getCustomizationText(product: Product): string {
  return normalizeText(
    [
      product.shortDescription,
      product.description,
      product.name,
      ...(product.useCaseCopy ?? []),
      ...(product.seoKeywords ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function isCustomPrintAvailable(product: Product): boolean {
  if (typeof product.customPrintAvailable === "boolean") {
    return product.customPrintAvailable;
  }
  const text = getCustomizationText(product);
  return (
    /(custom|personalized|branding).*(print|label|logo)/i.test(text) ||
    /(print|label|logo).*(custom|personalized|branding)/i.test(text)
  );
}

function isCustomShapeAvailable(product: Product): boolean {
  if (typeof product.customShapeAvailable === "boolean") {
    return product.customShapeAvailable;
  }
  const text = getCustomizationText(product);
  return (
    /(custom|bespoke).*(shape|mold|design)/i.test(text) ||
    /(shape|mold|design).*(custom|bespoke)/i.test(text)
  );
}

function isTablewareCapacityInRange(value: number, range: TablewareCapacityFilter): boolean {
  if (range === "under200") return value < 200;
  if (range === "200to500") return value >= 200 && value <= 500;
  if (range === "500plus") return value >= 500;
  return value >= 1000;
}

export function ProductCatalogLayout({
  title,
  description,
  products,
  categories,
  mode = "default",
}: ProductCatalogLayoutProps) {
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductTypeFilter[]>([]);
  const [selectedCapacityRanges, setSelectedCapacityRanges] = useState<CapacityFilter[]>([]);
  const [selectedClosureSizes, setSelectedClosureSizes] = useState<ClosureSizeFilter[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<ShapeFilter[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityFilter[]>([]);
  const [selectedCustomization, setSelectedCustomization] = useState<CustomizationFilter[]>([]);
  const [selectedTablewareTypes, setSelectedTablewareTypes] = useState<TablewareTypeFilter[]>([]);
  const [selectedTablewareCapacityRanges, setSelectedTablewareCapacityRanges] = useState<TablewareCapacityFilter[]>([]);
  const [selectedTablewarePackaging, setSelectedTablewarePackaging] = useState<TablewarePackagingFilter[]>([]);
  const [selectedTablewareGlassColors, setSelectedTablewareGlassColors] = useState<TablewareGlassColorFilter[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const categoryNameBySlug = useMemo(() => {
    return new Map(
      categories.map((category) => [category.slug, normalizeText(category.name)]),
    );
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (mode === "tableware") {
      next = next.filter((product) => product.isTableware);

      if (selectedTablewareTypes.length) {
        next = next.filter((product) => {
          const sub = product.subCategory ?? "other";
          return selectedTablewareTypes.includes(sub);
        });
      }

      if (selectedTablewareCapacityRanges.length) {
        next = next.filter((product) => {
          const capacityMl = getCapacityMl(product);
          if (capacityMl === undefined) return false;
          return selectedTablewareCapacityRanges.some((range) => isTablewareCapacityInRange(capacityMl, range));
        });
      }

      if (selectedTablewarePackaging.length) {
        next = next.filter((product) => {
          const packaging = product.packagingType;
          if (!packaging) return false;
          if (packaging === "both") return true;
          return selectedTablewarePackaging.includes(packaging);
        });
      }

      if (selectedTablewareGlassColors.length) {
        next = next.filter((product) => {
          const color = normalizeText(product.color ?? product.specs?.color ?? "");
          if (!color) return false;
          return selectedTablewareGlassColors.some((filterColor) => color.includes(filterColor));
        });
      }
    } else {
      if (selectedProductTypes.length) {
      next = next.filter((product) => {
        const slug = normalizeText(product.categorySlug);
        const categoryName = categoryNameBySlug.get(product.categorySlug) ?? "";
        return selectedProductTypes.some((selectedType) => {
          if (selectedType === "glassBottles") {
            return slug.includes("bottle") || categoryName.includes("bottle");
          }
          if (selectedType === "glassJars") {
            return slug.includes("jar") || categoryName.includes("jar");
          }
          return slug.includes("cap") || slug.includes("closure") || categoryName.includes("cap") || categoryName.includes("closure");
        });
      });
      }

      if (selectedCapacityRanges.length) {
        next = next.filter((product) => {
          const capacityMl = getCapacityMl(product);
          if (capacityMl === undefined) return false;
          return selectedCapacityRanges.some((range) => isCapacityInRange(capacityMl, range));
        });
      }

      if (selectedClosureSizes.length) {
        next = next.filter((product) => {
          const closureSizes = getProductClosureSizes(product);
          return selectedClosureSizes.some((selectedSize) => closureSizes.includes(selectedSize));
        });
      }

      if (selectedShapes.length) {
        next = next.filter((product) => {
          return selectedShapes.some((shape) => matchesShapeOption(product, shape));
        });
      }

      if (selectedAvailability.length) {
        next = next.filter((product) => {
          return selectedAvailability.some((availability) => {
            if (availability === "inStockOnly") return product.stock > 0;
            return product.isBestSeller;
          });
        });
      }

      if (selectedCustomization.length) {
        next = next.filter((product) => {
          return selectedCustomization.some((customization) => {
            if (customization === "customPrintAvailable") return isCustomPrintAvailable(product);
            return isCustomShapeAvailable(product);
          });
        });
      }
    }

    if (sortBy === "priceAsc") {
      next.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      next.sort((a, b) => b.price - a.price);
    }

    return next;
  }, [
    categoryNameBySlug,
    products,
    selectedAvailability,
    selectedCapacityRanges,
    selectedClosureSizes,
    selectedCustomization,
    selectedProductTypes,
    selectedShapes,
    selectedTablewareTypes,
    selectedTablewareCapacityRanges,
    selectedTablewarePackaging,
    selectedTablewareGlassColors,
    mode,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [safeCurrentPage, filteredProducts, ITEMS_PER_PAGE]);

  const totalCount = filteredProducts.length;
  const rangeStart = totalCount ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const rangeEnd = totalCount
    ? Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalCount)
    : 0;

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  function clearFilters() {
    setCurrentPage(1);
    setSelectedProductTypes([]);
    setSelectedCapacityRanges([]);
    setSelectedClosureSizes([]);
    setSelectedShapes([]);
    setSelectedAvailability([]);
    setSelectedCustomization([]);
    setSelectedTablewareTypes([]);
    setSelectedTablewareCapacityRanges([]);
    setSelectedTablewarePackaging([]);
    setSelectedTablewareGlassColors([]);
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

            {mode === "tableware" ? (
              <>
                <details className="filter-group" open>
                  <summary className="filter-group-summary">Type</summary>
                  <div className="filter-options">
                    {TABLEWARE_TYPE_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTablewareTypes.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedTablewareTypes((prev) => toggleSelection(prev, option.value));
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Capacity</summary>
                  <div className="filter-options">
                    {TABLEWARE_CAPACITY_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTablewareCapacityRanges.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedTablewareCapacityRanges((prev) => toggleSelection(prev, option.value));
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Packaging</summary>
                  <div className="filter-options">
                    {TABLEWARE_PACKAGING_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTablewarePackaging.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedTablewarePackaging((prev) => toggleSelection(prev, option.value));
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Glass Color</summary>
                  <div className="filter-options">
                    {TABLEWARE_GLASS_COLOR_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedTablewareGlassColors.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedTablewareGlassColors((prev) => toggleSelection(prev, option.value));
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </>
            ) : (
              <>
                <details className="filter-group" open>
                  <summary className="filter-group-summary">Product Type</summary>
                  <div className="filter-options">
                    {PRODUCT_TYPE_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedProductTypes.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedProductTypes((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Capacity / Volume</summary>
                  <div className="filter-options">
                    {CAPACITY_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedCapacityRanges.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedCapacityRanges((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Closure Size</summary>
                  <div className="filter-options">
                    {CLOSURE_SIZE_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedClosureSizes.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedClosureSizes((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Shape / Style</summary>
                  <div className="filter-options">
                    {SHAPE_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedShapes.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedShapes((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Availability</summary>
                  <div className="filter-options">
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedAvailability.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedAvailability((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>

                <details className="filter-group" open>
                  <summary className="filter-group-summary">Customization</summary>
                  <div className="filter-options">
                    {CUSTOMIZATION_OPTIONS.map((option) => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={selectedCustomization.includes(option.value)}
                          onChange={() => {
                            setCurrentPage(1);
                            setSelectedCustomization((prev) =>
                              toggleSelection(prev, option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </>
            )}
          </aside>

          <div className="catalog-results">
            <div className="catalog-results-toolbar">
              <p className="muted">
                Showing <strong>{rangeStart}</strong>-<strong>{rangeEnd}</strong> of{" "}
                <strong>{totalCount}</strong> product(s)
              </p>
              <div className="catalog-sort">
                <label htmlFor="sortBy">Sort by</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSortBy(event.target.value as SortBy);
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length ? (
              <div className="grid product-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="card empty-state">
                <h3>No products match these filters</h3>
              </div>
            )}

            {filteredProducts.length > ITEMS_PER_PAGE ? (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-button ${page === safeCurrentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
