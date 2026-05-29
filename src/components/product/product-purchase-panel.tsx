"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { SampleProgramDrawer } from "@/components/sample/sample-program-drawer";

type ProductPurchasePanelProps = {
  product: Product;
};

type PackagingMode = "brown_box" | "gift_box";

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem, items } = useCart();
  const closures = product.closures ?? [];
  const closureOptions = [{ id: "none", name: "No closure needed", price: 0 }, ...closures];

  const [boxCount, setBoxCount] = useState(1);
  const [selectedClosureId, setSelectedClosureId] = useState(closureOptions[0]?.id ?? "none");
  const [showSummary, setShowSummary] = useState(false);
  const [stockError, setStockError] = useState("");

  const isTableware = Boolean(product.isTableware);
  const isJugPitcher = product.subCategory === "jug";
  const tablewareSetSize = Math.max(1, product.giftBoxPcsPerSet ?? (isJugPitcher ? 1 : 6));
  const giftBoxSetsPerBox = Math.max(1, product.giftBoxSetsPerBox ?? (isJugPitcher ? 12 : 1));
  const packSize = Math.max(1, product.packSize ?? (isTableware ? giftBoxSetsPerBox * tablewareSetSize : 40));
  const packagingType = product.packagingType;
  const packagingOptions = useMemo<PackagingMode[]>(() => {
    if (!isTableware) return ["brown_box"];
    if (packagingType === "gift_box") return ["gift_box"];
    if (packagingType === "both") return ["brown_box", "gift_box"];
    return ["brown_box"];
  }, [isTableware, packagingType]);

  const [selectedPackagingMode, setSelectedPackagingMode] = useState<PackagingMode>(
    packagingOptions[0] ?? "brown_box",
  );
  const activePackagingMode =
    isTableware && packagingOptions.includes(selectedPackagingMode)
      ? selectedPackagingMode
      : (packagingOptions[0] ?? "brown_box");
  const giftBoxPcsPerSet = tablewareSetSize;
  const piecesPerBox =
    activePackagingMode === "gift_box" ? giftBoxSetsPerBox * giftBoxPcsPerSet : packSize;
  const safeBoxCount = Math.max(1, boxCount);
  const totalPcs = safeBoxCount * piecesPerBox;
  const totalSets = totalPcs / tablewareSetSize;
  const totalSetsDisplay = Number.isInteger(totalSets) ? String(totalSets) : totalSets.toFixed(2);
  const setsPerBox = piecesPerBox / tablewareSetSize;
  const setsPerBoxDisplay = Number.isInteger(setsPerBox) ? String(setsPerBox) : setsPerBox.toFixed(2);

  const brownBoxSetPrice = product.brownBoxPricePerPiece ?? product.price;
  const giftBoxSetPrice = product.giftBoxPricePerPiece ?? product.price;
  const activeSetPrice =
    isTableware && activePackagingMode === "gift_box" ? giftBoxSetPrice : brownBoxSetPrice;

  const selectedClosureOption =
    closureOptions.find((closure) => closure.id === selectedClosureId) ?? closureOptions[0];
  const selectedClosureRate = !isTableware ? selectedClosureOption?.price ?? 0 : 0;

  const inStock = product.stock > 0;
  const productCost = isTableware
    ? (activeSetPrice * totalPcs) / tablewareSetSize
    : activeSetPrice * totalPcs;
  const closureCost = selectedClosureRate * totalPcs;
  const grandTotal = productCost + closureCost;

  const selectedClosureLabel = selectedClosureOption?.sizeMm
    ? `${selectedClosureOption.name} (${selectedClosureOption.sizeMm}mm)`
    : selectedClosureOption?.name ?? "No closure needed";
  const selectedClosureSku = selectedClosureOption?.sizeMm
    ? `${selectedClosureOption.name}-${selectedClosureOption.sizeMm}mm`
    : selectedClosureOption?.name ?? "No closure needed";

  const mrp = product.compareAtPrice ?? null;
  const discountPct =
    mrp && mrp > activeSetPrice ? Math.round(((mrp - activeSetPrice) / mrp) * 100) : null;
  const gstInclusivePrice = activeSetPrice * 1.18;
  const quantityExceedsStock = inStock && totalPcs > product.stock;

  function handleAddToCart() {
    const existingProductQty =
      items.find((item) => item.id === product.id && item.categorySlug !== "closures")?.quantity ?? 0;
    const maxAddable = Math.max(product.stock - existingProductQty, 0);

    if (!inStock) {
      setStockError("This item is currently out of stock.");
      return;
    }

    if (maxAddable <= 0) {
      setStockError(`Only ${product.stock} units are available for this item.`);
      return;
    }

    if (totalPcs > maxAddable) {
      setStockError(
        `Only ${product.stock} units are available. You can add ${maxAddable} more unit${
          maxAddable === 1 ? "" : "s"
        }.`,
      );
      return;
    }

    setStockError("");
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      categorySlug: product.categorySlug,
      price: activeSetPrice,
      priceUnit: isTableware ? "per_set" : "per_piece",
      setSize: isTableware ? tablewareSetSize : undefined,
      quantity: totalPcs,
      packagingMode: isTableware ? activePackagingMode : undefined,
      maxStock: product.stock,
      packSize: piecesPerBox,
      image: product.images?.[0],
    });

    if (!isTableware && selectedClosureRate > 0 && selectedClosureId !== "none") {
      addItem({
        id: `${product.id}-closure-${selectedClosureId}`,
        slug: product.slug,
        name: `${selectedClosureLabel} (Closure)`,
        sku: `${product.sku}-CAP-${selectedClosureSku}`,
        categorySlug: "closures",
        price: selectedClosureRate,
        quantity: totalPcs,
        parentId: product.id,
        maxStock: product.stock,
        packSize: piecesPerBox,
      });
    }

    setShowSummary(true);
  }

  return (
    <div className="purchase-panel">
      <SampleProgramDrawer product={product} />
      <div className="purchase-header">
        <div>
          <span className="badge">{product.categorySlug.replace(/-/g, " ")}</span>
          <h2>{product.name}</h2>
          {isTableware && product.capacityDisplay ? (
            <span className="product-capacity-tag">{product.capacityDisplay}</span>
          ) : null}
          <div className="sku-stock-row">
            <span className="sku-text">SKU: {product.sku}</span>
            <span className={`stock-dot ${inStock ? "in" : "out"}`}>
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          <p className="muted">{product.shortDescription}</p>
        </div>
      </div>

      <div className="purchase-grid">
        <div className="purchase-controls">
          <div className="price-box">
            {discountPct && mrp ? (
              <div className="price-top-row">
                <span className="price-discount-badge">{discountPct}% off</span>
                <span className="price-mrp">
                  M.R.P. <s>Rs. {mrp.toFixed(2)}</s>
                </span>
              </div>
            ) : null}

            <div className="price-main-row">
              <span key={`${activePackagingMode}-${activeSetPrice}`} className="price-final price-highlighted">
                {formatCurrency(activeSetPrice)}
              </span>
              <span className="price-tag-gst">{isTableware ? "per set" : "GST Excl."}</span>
            </div>

            <div className="price-gst-row">
              <span className="price-gst-label">
                Rs. {gstInclusivePrice.toFixed(2)} inclusive of all taxes (18% GST)
              </span>
            </div>
            {isTableware ? (
              <div className="price-gst-row">
                <span className="price-gst-label">
                  Price shown is per set (1 set = {tablewareSetSize} {tablewareSetSize === 1 ? "pc" : "pcs"}).
                </span>
              </div>
            ) : null}
          </div>

          <div className="control-block">
            <h4>{isTableware ? "PACKAGING OPTIONS" : "Select Quantity"}</h4>

            {isTableware ? (
              <div className="packaging-tabs">
                {packagingOptions.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`packaging-tab ${selectedPackagingMode === mode ? "active" : ""}`}
                    onClick={() => setSelectedPackagingMode(mode)}
                  >
                    <span className="packaging-tab-main">
                      <span className="packaging-tab-icon" aria-hidden="true">
                        {mode === "gift_box" ? (
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35">
                            <rect x="2.2" y="6.2" width="11.6" height="7.6" rx="1.2" />
                            <path d="M8 6.2v7.6M2.2 9.2h11.6" strokeLinecap="round" />
                            <path d="M8 6.2c-1.2 0-2.2-.6-2.2-1.6 0-.8.7-1.5 1.5-1.5 1 0 1.8 1 2.1 2 .3-1 .9-2 2-2 .9 0 1.5.7 1.5 1.5 0 1-.9 1.6-2.1 1.6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35">
                            <path d="M2.4 5.3 8 2.2l5.6 3.1v6.1L8 14.4l-5.6-3z" />
                            <path d="M8 2.2v12.2M2.4 5.3 8 8.4l5.6-3.1" strokeLinecap="round" />
                          </svg>
                        )}
                      </span>
                      <span>{mode === "gift_box" ? "Gift Box Set" : "Brown Box"}</span>
                    </span>
                    {selectedPackagingMode === mode ? (
                      <span className="packaging-tab-meta">
                        {mode === "gift_box" ? "Printed box - Set packing" : "Standard bulk packing"}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="qty-table">
              <div className="qty-row qty-header">
                <span>BOX</span>
                <span>PCS/BOX</span>
                <span>TOTAL PCS</span>
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
                <span>{piecesPerBox}</span>
                <span>{totalPcs}</span>
              </div>
            </div>

            {isTableware ? (
              <div className="gift-box-info-card" role="note" aria-live="polite">
                <span className="gift-box-info-icon" aria-hidden="true">
                  []
                </span>
                <span>
                  1 Box = {setsPerBoxDisplay} Sets x {giftBoxPcsPerSet} Pcs per Set = {piecesPerBox} Pcs
                </span>
              </div>
            ) : null}

            {quantityExceedsStock ? (
              <p className="form-error" style={{ marginTop: "0.65rem" }}>
                Only {product.stock} units are currently available for this item.
              </p>
            ) : null}
          </div>

          {!isTableware ? (
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
          ) : null}

          <div className="action-row">
            <button
              type="button"
              className="btn btn-primary btn-cta"
              onClick={handleAddToCart}
              disabled={!inStock || quantityExceedsStock || (isTableware && !packagingOptions.length)}
            >
              Add to Cart
            </button>
          </div>

          {stockError ? (
            <p className="form-error" style={{ marginTop: "0.65rem" }}>
              {stockError}
            </p>
          ) : null}

          <p className={`stock-pill ${inStock ? "in" : "out"}`}>
            {inStock ? "In Stock - Dispatches in 24-48 hrs" : "Out of Stock - Back soon"}
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
                {!isTableware ? <span>{selectedClosureLabel}</span> : null}
              </div>
              <div className="summary-line">
                <span>Total pcs</span>
                <strong>{totalPcs}</strong>
              </div>
              <div className="summary-line">
                <span>
                  {product.name} (
                  {isTableware
                    ? `${formatCurrency(activeSetPrice)} per set x ${totalSetsDisplay} sets`
                    : `${formatCurrency(activeSetPrice)} x ${totalPcs}`}
                  )
                </span>
                <strong>{formatCurrency(productCost)}</strong>
              </div>
              {!isTableware && selectedClosureRate > 0 && selectedClosureId !== "none" ? (
                <div className="summary-line">
                  <span>
                    {selectedClosureLabel} ({formatCurrency(selectedClosureRate)} x {totalPcs})
                  </span>
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
