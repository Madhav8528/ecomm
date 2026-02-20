"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";

const DEFAULT_CLOSURES = [
  {
    name: "Silver Screw Cap",
    price: 2,
    image:
      "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'120'%20height%3D'120'%3E%3Crect%20width%3D'120'%20height%3D'120'%20rx%3D'18'%20fill%3D'%23e9edf2'/%3E%3Ccircle%20cx%3D'60'%20cy%3D'60'%20r%3D'36'%20fill%3D'%23b9c0c8'/%3E%3Ctext%20x%3D'60'%20y%3D'66'%20text-anchor%3D'middle'%20font-size%3D'16'%20font-family%3D'Arial'%20fill%3D'%23455463'%3ESilver%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Gold Metal Lid",
    price: 3,
    image:
      "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'120'%20height%3D'120'%3E%3Crect%20width%3D'120'%20height%3D'120'%20rx%3D'18'%20fill%3D'%23fff1d6'/%3E%3Ccircle%20cx%3D'60'%20cy%3D'60'%20r%3D'36'%20fill%3D'%23e2b869'/%3E%3Ctext%20x%3D'60'%20y%3D'66'%20text-anchor%3D'middle'%20font-size%3D'16'%20font-family%3D'Arial'%20fill%3D'%237a5a1d'%3EGold%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Matte Black Cap",
    price: 4,
    image:
      "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'120'%20height%3D'120'%3E%3Crect%20width%3D'120'%20height%3D'120'%20rx%3D'18'%20fill%3D'%2325282e'/%3E%3Ccircle%20cx%3D'60'%20cy%3D'60'%20r%3D'36'%20fill%3D'%23393d46'/%3E%3Ctext%20x%3D'60'%20y%3D'66'%20text-anchor%3D'middle'%20font-size%3D'16'%20font-family%3D'Arial'%20fill%3D'%23f1f3f5'%3EBlack%3C/text%3E%3C/svg%3E",
  },
  {
    name: "Wooden Cork",
    price: 6,
    image:
      "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'120'%20height%3D'120'%3E%3Crect%20width%3D'120'%20height%3D'120'%20rx%3D'18'%20fill%3D'%23f7e6d4'/%3E%3Ccircle%20cx%3D'60'%20cy%3D'60'%20r%3D'36'%20fill%3D'%23c08a5c'/%3E%3Ctext%20x%3D'60'%20y%3D'66'%20text-anchor%3D'middle'%20font-size%3D'16'%20font-family%3D'Arial'%20fill%3D'%236a3f1c'%3EWood%3C/text%3E%3C/svg%3E",
  },
];

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const packSize = product.packSize ?? 40;
  const closures = product.closures?.length ? product.closures : DEFAULT_CLOSURES;
  const closureOptions = [
    { name: "No closure needed", price: 0 },
    ...closures,
  ];
  const [boxCount, setBoxCount] = useState(1);
  const [selectedClosure, setSelectedClosure] = useState(closureOptions[0]?.name ?? "");
  const [showSummary, setShowSummary] = useState(false);

  const safePackSize = Math.max(1, packSize);
  const safeBoxCount = Math.max(1, boxCount);
  const totalPcs = useMemo(() => safeBoxCount * safePackSize, [safeBoxCount, safePackSize]);
  const selectedClosureRate =
    closureOptions.find((closure) => closure.name === selectedClosure)?.price ?? 0;
  const inStock = product.stock > 0;
  const productCost = product.price * totalPcs;
  const closureCost = selectedClosureRate * totalPcs;
  const grandTotal = productCost + closureCost;

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
    });

    if (selectedClosureRate > 0 && selectedClosure !== "No closure needed") {
      addItem({
        id: `${product.id}-closure-${selectedClosure}`,
        slug: product.slug,
        name: `${selectedClosure} (Closure)`,
        sku: `${product.sku}-CAP`,
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
                value={selectedClosure}
                onChange={(event) => setSelectedClosure(event.target.value)}
              >
                {closureOptions.map((closure) => (
                  <option key={closure.name} value={closure.name}>
                    {closure.price > 0
                      ? `${closure.name} (+${formatCurrency(closure.price)})`
                      : closure.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted closure-note">* Closure price added per piece</p>
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
            ✓ In Stock — Dispatches in 24-48 hrs
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
                <span>{selectedClosure}</span>
              </div>
              <div className="summary-line">
                <span>Total pcs</span>
                <strong>{totalPcs}</strong>
              </div>
              <div className="summary-line">
                <span>{product.name} ({formatCurrency(product.price)} x {totalPcs})</span>
                <strong>{formatCurrency(productCost)}</strong>
              </div>
              {selectedClosureRate > 0 && selectedClosure !== "No closure needed" ? (
                <div className="summary-line">
                  <span>{selectedClosure} ({formatCurrency(selectedClosureRate)} x {totalPcs})</span>
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
