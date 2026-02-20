"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

export function CartPageContent() {
  const { items, subtotal, updateQuantity, removeItem, clearCart, isHydrated } = useCart();
  const { user, login } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  if (!isHydrated) {
    return (
      <div className="card">
        <p className="muted">Loading your cart...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card empty-state">
        <h3>Your cart is empty</h3>
        <p className="muted" style={{ marginTop: "0.4rem" }}>
          Add items from the catalog and return here to checkout.
        </p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;
  const meetsMinimum = subtotal >= 8000;
  const minimumMessage = `Minimum order value is ${formatCurrency(8000)} before GST. Current subtotal: ${formatCurrency(subtotal)}. Add more items to proceed.`;

  async function handleProceed() {
    if (!meetsMinimum) return;
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

  function getBoxCount(item: typeof items[number]) {
    const packSize = getPackSize(item);
    return Math.max(1, Math.ceil(item.quantity / packSize));
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
    const totalPcs = safeBoxes * packSize;
    updateQuantity(item.id, totalPcs);
    const closures = findClosureItems(item.id, item.slug);
    closures.forEach((closure) => updateQuantity(closure.id, totalPcs));
  }

  return (
    <>
    <div className="split-layout">
      <section className="card list-panel">
        {items.map((item) => (
          <article key={item.id} className="cart-row">
            <div>
              <Link href={`/products/${item.slug}`} className="cart-row-title">
                {item.name}
              </Link>
              <p className="muted">
                SKU: {item.sku} | {formatCurrency(item.price)}
              </p>
              {item.categorySlug !== "closures" ? (
                <p className="muted" style={{ marginTop: "0.25rem" }}>
                  {getBoxCount(item)} box{getBoxCount(item) > 1 ? "es" : ""} ×{" "}
                  {getPackSize(item)} pcs/box = {getBoxCount(item) * getPackSize(item)} pcs
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <div className="quantity-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() =>
                    item.categorySlug === "closures"
                      ? updateQuantity(item.id, item.quantity - 1)
                      : updateBoxes(item, getBoxCount(item) - 1)
                  }
                >
                  -
                </button>
                <span>
                  {item.categorySlug === "closures"
                    ? item.quantity
                    : getBoxCount(item)}
                </span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() =>
                    item.categorySlug === "closures"
                      ? updateQuantity(item.id, item.quantity + 1)
                      : updateBoxes(item, getBoxCount(item) + 1)
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
            </div>
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
        <button
          type="button"
          className="btn btn-primary"
          style={{ textAlign: "center" }}
          disabled={!meetsMinimum}
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
      <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
        <div className="modal-card" onClick={(event) => event.stopPropagation()}>
          <h3>Sign In to Continue</h3>
          <p className="muted">Login to proceed to checkout.</p>
          <form onSubmit={handleLogin} className="form-grid" style={{ marginTop: "0.8rem" }}>
            <div className="form-row">
              <label htmlFor="cart-login-email">Email</label>
              <input
                id="cart-login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="cart-login-password">Password</label>
              <input
                id="cart-login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            {loginError ? <p className="form-error">{loginError}</p> : null}
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setShowLogin(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loggingIn}>
                {loggingIn ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
          <div style={{ marginTop: "0.8rem" }}>
            <Link href="/register" className="btn btn-primary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
