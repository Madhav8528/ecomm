"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

const CART_STOCK_NOTICE_KEY = "clearpiece-cart-stock-notice-v1";

export function CartPageContent() {
  const { items, subtotal, updateQuantity, removeItem, clearCart, isHydrated } = useCart();
  const { user, login } = useAuth();
  const router = useRouter();
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [stockNotice] = useState(() => {
    if (typeof window === "undefined") return "";
    const notice = window.sessionStorage.getItem(CART_STOCK_NOTICE_KEY) ?? "";
    if (notice) {
      window.sessionStorage.removeItem(CART_STOCK_NOTICE_KEY);
    }
    return notice;
  });
  const [lineWarnings, setLineWarnings] = useState<Record<string, string>>({});

  if (!isHydrated) {
    return (
      <div className="card">
        <p className="muted">Loading your cart...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-cart-state">
        <div className="empty-cart-icon">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 12h6l8 32h28l6-22H20" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="28" cy="52" r="3" />
            <circle cx="46" cy="52" r="3" />
          </svg>
        </div>
        <h3>Your cart is empty</h3>
        <p className="muted">Browse our catalog and add products to get started.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;
  const meetsMinimum = subtotal >= 8000;
  const minimumMessage = `Minimum order value is ${formatCurrency(8000)} before GST. Current subtotal: ${formatCurrency(subtotal)}. Add more items to proceed.`;

  async function handleProceed() {
    if (!meetsMinimum || !acceptPolicies) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    router.push("/checkout");
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    const result = await login(loginEmail, loginPassword);
    setLoggingIn(false);
    if (!result.ok) {
      setLoginError(result.error ?? "Unable to login.");
      return;
    }
    setShowLogin(false);
    router.push("/checkout");
  }

  function getPackSize(item: typeof items[number]) {
    return Math.max(1, item.packSize ?? 40);
  }

  function getSetSize(item: typeof items[number]) {
    return Math.max(1, item.setSize ?? 6);
  }

  function getLineTotal(item: typeof items[number]) {
    if (item.priceUnit === "per_set") {
      return (item.price * item.quantity) / getSetSize(item);
    }
    return item.price * item.quantity;
  }

  function getBoxCount(item: typeof items[number]) {
    const packSize = getPackSize(item);
    return Math.max(1, Math.ceil(item.quantity / packSize));
  }

  function clearLineWarning(id: string) {
    setLineWarnings((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function updateQuantityWithStockCheck(item: typeof items[number], requestedQuantity: number) {
    const maxStock = typeof item.maxStock === "number" ? Math.max(0, item.maxStock) : undefined;
    const safeRequested = Math.max(0, Math.floor(requestedQuantity));
    const cappedQuantity =
      typeof maxStock === "number" ? Math.min(safeRequested, maxStock) : safeRequested;

    updateQuantity(item.id, cappedQuantity);

    if (typeof maxStock === "number" && safeRequested > maxStock) {
      setLineWarnings((prev) => ({
        ...prev,
        [item.id]: `Only ${maxStock} units are available for this item.`,
      }));
      return cappedQuantity;
    }

    clearLineWarning(item.id);
    return cappedQuantity;
  }

  function findClosureItems(productId: string, productSlug: string) {
    return items.filter((line) => {
      if (line.categorySlug !== "closures") return false;
      if (line.parentId && String(line.parentId) === String(productId)) return true;
      return line.slug === productSlug || line.id.startsWith(`${productId}-closure-`);
    });
  }

  function updateBoxes(item: typeof items[number], boxes: number) {
    const safeBoxes = Math.max(1, boxes);
    const packSize = getPackSize(item);
    const requestedTotalPcs = safeBoxes * packSize;
    const maxStock = typeof item.maxStock === "number" ? Math.max(0, item.maxStock) : undefined;
    if (typeof maxStock === "number" && requestedTotalPcs > maxStock) {
      setLineWarnings((prev) => ({
        ...prev,
        [item.id]: `Only ${maxStock} units are available for this item.`,
      }));
      return;
    }

    clearLineWarning(item.id);
    const totalPcs = updateQuantityWithStockCheck(item, requestedTotalPcs);
    const closures = findClosureItems(item.id, item.slug);
    closures.forEach((closure) => updateQuantityWithStockCheck(closure, totalPcs));
  }

  return (
    <>
    {stockNotice ? (
      <div className="card" style={{ marginBottom: "0.9rem" }}>
        <p className="form-error">{stockNotice}</p>
      </div>
    ) : null}
    <div className="split-layout">
      <section className="card list-panel">
        {items.map((item) => (
          <article key={item.id} className="cart-row">
            <div className="cart-row-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="cart-row-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="cart-row-info">
              <Link href={`/products/${item.slug}`} className="cart-row-title">{item.name}</Link>
              <p className="cart-row-sku">SKU: {item.sku}</p>
              {item.categorySlug !== "closures" ? (
                <p className="cart-row-meta">
                  {getBoxCount(item)} box{getBoxCount(item) > 1 ? "es" : ""} &times; {getPackSize(item)} pcs/box
                  <span className="cart-row-total-pcs"> = {item.quantity} pcs</span>
                </p>
              ) : null}
              <p className="cart-row-unit-price">
                {formatCurrency(item.price)}{" "}
                <span className="cart-row-price-label">
                  {item.priceUnit === "per_set"
                    ? `per set (${getSetSize(item)} ${getSetSize(item) === 1 ? "pc" : "pcs"})`
                    : "per pc"}
                </span>
              </p>
            </div>

            <div className="cart-row-controls">
              <div className="quantity-control">
                <button type="button" className="qty-btn" onClick={() =>
                  item.categorySlug === "closures"
                    ? updateQuantityWithStockCheck(item, item.quantity - 1)
                    : updateBoxes(item, getBoxCount(item) - 1)
                }>-</button>
                <span className="qty-value">
                  {item.categorySlug === "closures" ? item.quantity : getBoxCount(item)}
                </span>
                <button type="button" className="qty-btn" onClick={() =>
                  item.categorySlug === "closures"
                    ? updateQuantityWithStockCheck(item, item.quantity + 1)
                    : updateBoxes(item, getBoxCount(item) + 1)
                }>+</button>
              </div>
              <p className="cart-row-line-total">{formatCurrency(getLineTotal(item))}</p>
              <button
                type="button"
                className="cart-row-remove"
                onClick={() => removeItem(item.id)}
                aria-label="Remove item"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {lineWarnings[item.id] ? (
              <p className="form-error" style={{ marginTop: "0.5rem" }}>
                {lineWarnings[item.id]}
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <aside className="card summary-block">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span className="muted">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span className="muted">GST @ 18%</span>
          <span>{formatCurrency(gstAmount)}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Grand Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
        {!meetsMinimum ? (
          <p className="form-error">{minimumMessage}</p>
        ) : null}
        <label className="contact-policy-consent" htmlFor="cart-policy-consent">
          <input
            id="cart-policy-consent"
            type="checkbox"
            checked={acceptPolicies}
            onChange={(event) => setAcceptPolicies(event.target.checked)}
          />
          <span>
            I have read and agree to the <Link href="/terms-and-conditions">Terms & Conditions</Link> and{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </span>
        </label>
        {meetsMinimum && !acceptPolicies ? (
          <p className="form-error">Please accept Terms & Conditions and Privacy Policy to continue.</p>
        ) : null}
        <button
          type="button"
          className="btn btn-primary"
          style={{ textAlign: "center" }}
          disabled={!meetsMinimum || !acceptPolicies}
          onClick={handleProceed}
        >
          Proceed to Checkout
        </button>
        <button type="button" className="btn" onClick={clearCart}>
          Clear Cart
        </button>
      </aside>
    </div>
    {showLogin ? (
      <div className="auth-drawer-backdrop" onClick={() => setShowLogin(false)}>
        <div className="auth-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="auth-drawer-header">
            <div>
              <p className="auth-drawer-eyebrow">One step away</p>
              <h2 className="auth-drawer-title">Sign in to place your order</h2>
            </div>
            <button
              type="button"
              className="auth-drawer-close"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="auth-drawer-divider" />

          <form onSubmit={handleLogin} className="auth-drawer-form">
            <div className="auth-drawer-field">
              <label htmlFor="cart-login-email">Email address</label>
              <input
                id="cart-login-email"
                type="email"
                required
                placeholder="you@company.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="auth-drawer-field">
              <div className="auth-drawer-label-row">
                <label htmlFor="cart-login-password">Password</label>
                <a href="/forgot-password" className="auth-drawer-forgot">Forgot password?</a>
              </div>
              <input
                id="cart-login-password"
                type="password"
                required
                placeholder="????????"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            {loginError ? (
              <div className="auth-drawer-error">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3M8 11v.5" strokeLinecap="round" />
                </svg>
                {loginError}
              </div>
            ) : null}
            <button type="submit" className="btn btn-primary auth-drawer-submit" disabled={loggingIn}>
              {loggingIn ? (
                <>
                  <span className="auth-spinner" />
                  Signing in?</>
              ) : (
                <>Sign In &amp; Proceed to Checkout</>
              )}
            </button>
          </form>

          <div className="auth-drawer-footer">
            <p className="auth-drawer-or"><span>or</span></p>
            <p className="auth-drawer-register-prompt">New to ClearPiece?</p>
            <a href="/register" className="btn auth-drawer-register-btn">Create a Free Account</a>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
