"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const packSize = product.packSize ?? 40;
  const closures = product.closures ?? [];
  const closureOptions = [
    { id: "none", name: "No closure needed", price: 0 },
    ...closures,
  ];
  const [boxCount, setBoxCount] = useState(1);
  const [selectedClosureId, setSelectedClosureId] = useState(closureOptions[0]?.id ?? "none");
  const [showSummary, setShowSummary] = useState(false);

  const safePackSize = Math.max(1, packSize);
  const safeBoxCount = Math.max(1, boxCount);
  const totalPcs = useMemo(() => safeBoxCount * safePackSize, [safeBoxCount, safePackSize]);
  const selectedClosureOption =
    closureOptions.find((closure) => closure.id === selectedClosureId) ?? closureOptions[0];
  const selectedClosureRate = selectedClosureOption?.price ?? 0;
  const inStock = product.stock > 0;
  const productCost = product.price * totalPcs;
  const closureCost = selectedClosureRate * totalPcs;
  const grandTotal = productCost + closureCost;
  const selectedClosureLabel = selectedClosureOption?.sizeMm
    ? `${selectedClosureOption.name} (${selectedClosureOption.sizeMm}mm)`
    : selectedClosureOption?.name ?? "No closure needed";
  const selectedClosureSku = selectedClosureOption?.sizeMm
    ? `${selectedClosureOption.name}-${selectedClosureOption.sizeMm}mm`
    : selectedClosureOption?.name ?? "No closure needed";

  function handleAddToCart() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      categorySlug: product.categorySlug,
      price: product.price,
      quantity: totalPcs,
      packSize: packSize,
      image: product.images?.[0],
    });

    if (selectedClosureRate > 0 && selectedClosureId !== "none") {
      addItem({
        id: `${product.id}-closure-${selectedClosureId}`,
        slug: product.slug,
        name: `${selectedClosureLabel} (Closure)`,
        sku: `${product.sku}-CAP-${selectedClosureSku}`,
        categorySlug: "closures",
        price: selectedClosureRate,
        quantity: totalPcs,
        parentId: product.id,
        packSize: packSize,
      });
    }

    setShowSummary(true);
  }

  return (
    <div className="purchase-panel">
      <div className="purchase-header">
        <div>
          <span className="badge">{product.categorySlug.replace(/-/g, " ")}</span>
          <h2>{product.name}</h2>
          <div className="sku-stock-row">
            <span className="sku-text">SKU: {product.sku}</span>
            <span className={`stock-dot ${inStock ? "in" : "out"}`}>
              ● {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          <p className="muted">{product.shortDescription}</p>
        </div>
      </div>

      <div className="purchase-grid">
        <div className="purchase-controls">
          <div className="price-box">
            <span className="price">
              {formatCurrency(product.price)} <span className="price-tag">(GST Exclusive)</span>
            </span>
            <span className="price-secondary">
              MRP: {formatCurrency(product.price * 1.18)}{" "}
              <span className="price-meta">(18% GST Inclusive)</span>
            </span>
          </div>
          <div className="control-block">
            <h4>Select Quantity</h4>
            <div className="qty-table">
              <div className="qty-row qty-header">
                <span>Box</span>
                <span>Pcs/Box</span>
                <span>Total Pcs</span>
              </div>
              <div className="qty-row">
                <span>
                  <div className="quantity-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setBoxCount((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease box quantity"
                    >
                      -
                    </button>
                    <span className="qty-value">{boxCount}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setBoxCount((prev) => prev + 1)}
                      aria-label="Increase box quantity"
                    >
                      +
                    </button>
                  </div>
                </span>
                <span>{packSize}</span>
                <span>{totalPcs}</span>
              </div>
            </div>
          </div>

          <div className="control-block">
            <h4 className="closure-heading">CLOSURE OPTIONS FOR THIS GLASS BOTTLE *</h4>
            <label className="field field-full">
              <select
                value={selectedClosureId}
                onChange={(event) => setSelectedClosureId(event.target.value)}
              >
                {closureOptions.map((closure) => (
                  <option key={closure.id} value={closure.id}>
                    {closure.sizeMm ? `${closure.name} (${closure.sizeMm}mm)` : closure.name}
                    {closure.price > 0 ? ` (+${formatCurrency(closure.price)})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted closure-note">* Closure price added per piece</p>
            {selectedClosureOption?.image ? (
              <div className="closure-row">
                <div className="closure-preview">
                  <img src={selectedClosureOption.image} alt={selectedClosureLabel} />
                </div>
                <div>
                  <strong>{selectedClosureLabel}</strong>
                  <p className="muted">Selected closure preview</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn btn-primary btn-cta"
              onClick={handleAddToCart}
            >
              <span className="btn-icon">🛒</span> Add to Cart
            </button>
          </div>
          <p className={`stock-pill ${inStock ? "in" : "out"}`}>
            In Stock - Dispatches in 24-48 hrs
          </p>
        </div>

      </div>
      {showSummary ? (
        <div className="cart-modal-backdrop" role="dialog" aria-modal="true">
          <div className="cart-modal">
            <div className="cart-modal-header">
              <h3>Added to Cart</h3>
              <button type="button" onClick={() => setShowSummary(false)} className="btn-link">
                Close
              </button>
            </div>
            <div className="cart-modal-body">
              <div className="summary-title">
                <strong>{product.name}</strong>
                <span>{selectedClosureLabel}</span>
              </div>
              <div className="summary-line">
                <span>Total pcs</span>
                <strong>{totalPcs}</strong>
              </div>
              <div className="summary-line">
                <span>{product.name} ({formatCurrency(product.price)} x {totalPcs})</span>
                <strong>{formatCurrency(productCost)}</strong>
              </div>
              {selectedClosureRate > 0 && selectedClosureId !== "none" ? (
                <div className="summary-line">
                  <span>{selectedClosureLabel} ({formatCurrency(selectedClosureRate)} x {totalPcs})</span>
                  <strong>{formatCurrency(closureCost)}</strong>
                </div>
              ) : null}
              <div className="summary-line total">
                <span>Total</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>
            </div>
            <div className="cart-modal-actions">
              <Link href="/cart" className="btn btn-primary">
                View Cart
              </Link>
              <button type="button" className="btn" onClick={() => setShowSummary(false)}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
