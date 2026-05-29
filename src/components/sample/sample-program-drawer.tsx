"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/catalog";

type SampleBoxItem = {
  product_id: number;
  product_name: string;
  product_slug: string;
  product_sku: string;
  product_image: string;
  quantity: number;
};

type SampleBoxResponse = {
  sample_box: {
    max_units: number;
    total_units: number;
    remaining_units: number;
    sample_fee: number;
    items: SampleBoxItem[];
  };
  credit: {
    available_amount: number;
    source_request_id: string;
    already_used: boolean;
  };
};

type SubmitSampleResponse = {
  status: "submitted";
  sample_request: {
    request_id: string;
    status: string;
  };
  sample_box: SampleBoxResponse["sample_box"];
  credit: SampleBoxResponse["credit"];
};

type SampleProgramDrawerProps = {
  product: Product;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const error = (payload.error as string) || (payload.detail as string) || "Request failed";
    throw new Error(error);
  }
  return payload as T;
}

export function SampleProgramDrawer({ product }: SampleProgramDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);
  const [boxState, setBoxState] = useState<SampleBoxResponse | null>(null);

  const productId = Number(product.id);
  const productImage = product.images?.[0] ?? "";

  const currentItem = useMemo(() => {
    return boxState?.sample_box.items.find((item) => item.product_id === productId) ?? null;
  }, [boxState, productId]);

  async function withAuthGuard<T>(requestPromise: Promise<Response>): Promise<T> {
    const response = await requestPromise;
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      throw new Error("Please login to request samples.");
    }
    return parseResponse<T>(response);
  }

  async function loadSampleBox() {
    setLoading(true);
    setError("");
    try {
      const data = await withAuthGuard<SampleBoxResponse>(fetch("/api/sample/box", { cache: "no-store" }));
      setBoxState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load sample box.");
    } finally {
      setLoading(false);
    }
  }

  async function openDrawer() {
    setIsOpen(true);
    setMessage("");
    await loadSampleBox();
  }

  async function addToSampleBox() {
    if (!boxState) return;
    setError("");
    setMessage("");

    const existingQty = currentItem?.quantity ?? 0;
    const nextQty = existingQty + addQuantity;

    try {
      const data = await withAuthGuard<{ sample_box: SampleBoxResponse["sample_box"] }>(
        fetch("/api/sample/box/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, quantity: nextQty }),
        }),
      );
      setBoxState((prev) => (prev ? { ...prev, sample_box: data.sample_box } : prev));
      setMessage("Added to Sample Box.");
      setAddQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update sample box.");
    }
  }

  async function updateItemQuantity(productIdToUpdate: number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(productIdToUpdate);
      return;
    }
    setError("");
    setMessage("");
    try {
      const data = await withAuthGuard<{ sample_box: SampleBoxResponse["sample_box"] }>(
        fetch(`/api/sample/box/items/${productIdToUpdate}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        }),
      );
      setBoxState((prev) => (prev ? { ...prev, sample_box: data.sample_box } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update quantity.");
    }
  }

  async function removeItem(productIdToDelete: number) {
    setError("");
    setMessage("");
    try {
      const data = await withAuthGuard<{ sample_box: SampleBoxResponse["sample_box"] }>(
        fetch(`/api/sample/box/items/${productIdToDelete}`, {
          method: "DELETE",
        }),
      );
      setBoxState((prev) => (prev ? { ...prev, sample_box: data.sample_box } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove sample.");
    }
  }

  async function submitSampleRequest() {
    if (!boxState?.sample_box.items.length) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const data = await withAuthGuard<SubmitSampleResponse>(
        fetch("/api/sample/box/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      );
      setBoxState((prev) =>
        prev
          ? {
              ...prev,
              sample_box: data.sample_box,
              credit: data.credit,
            }
          : null,
      );
      setMessage(`Sample request ${data.sample_request.request_id} submitted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit sample request.");
    } finally {
      setSubmitting(false);
    }
  }

  const maxUnits = boxState?.sample_box.max_units ?? 6;
  const totalUnits = boxState?.sample_box.total_units ?? 0;
  const remainingUnits = boxState?.sample_box.remaining_units ?? maxUnits;
  const existingQty = currentItem?.quantity ?? 0;
  const canAddMore = remainingUnits > 0;

  const safeAddQty = Math.min(addQuantity, Math.max(1, remainingUnits || 1));

  return (
    <>
      <button
        type="button"
        className="sample-request-tab"
        onClick={openDrawer}
        aria-label="Open sample request drawer"
      >
        Request Sample
      </button>

      <button
        type="button"
        className="sample-mobile-cta"
        onClick={openDrawer}
        aria-label="Request sample"
      >
        Request Sample
      </button>

      {isOpen ? (
        <div className="sample-drawer-overlay" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
          <div className="sample-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="sample-drawer-header">
              <div>
                <p className="sample-drawer-eyebrow">ClearPiece Sample Program</p>
                <h3>Build Your Sample Box</h3>
              </div>
              <button type="button" className="btn" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            {loading ? (
              <div className="sample-drawer-loading">Loading sample box...</div>
            ) : (
              <>
                <div className="sample-product-block">
                  <div className="sample-product-media">
                    {productImage ? <img src={productImage} alt={product.name} /> : <span>No image</span>}
                  </div>
                  <div className="sample-product-copy">
                    <p className="sample-product-name">{product.name}</p>
                    <p className="sample-product-sku">SKU: {product.sku}</p>
                    <p className="sample-product-note">
                      Add this SKU to your Sample Box. Maximum {maxUnits} units across all products.
                    </p>
                  </div>
                </div>

                <div className="sample-add-controls">
                  <div className="quantity-control sample-qty-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setAddQuantity((prev) => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <span className="qty-value">{safeAddQty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setAddQuantity((prev) => Math.min(Math.max(1, remainingUnits), prev + 1))}
                      disabled={!canAddMore}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={addToSampleBox} disabled={!canAddMore}>
                    {existingQty > 0 ? "Update In Box" : "Add To Sample Box"}
                  </button>
                </div>

                <div className="sample-summary">
                  <div className="sample-summary-head">
                    <h4>Sample Box Summary</h4>
                    <span>
                      {totalUnits}/{maxUnits} units
                    </span>
                  </div>

                  {boxState?.sample_box.items.length ? (
                    <ul className="sample-items-list">
                      {boxState.sample_box.items.map((item) => (
                        <li key={item.product_id} className="sample-item-row">
                          <div>
                            <p>{item.product_name}</p>
                            <span>{item.product_sku}</span>
                          </div>
                          <div className="sample-item-actions">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <strong>{item.quantity}</strong>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                              disabled={(boxState.sample_box.total_units ?? 0) >= maxUnits}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              className="sample-remove-btn"
                              onClick={() => removeItem(item.product_id)}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sample-empty-note">Your Sample Box is empty.</p>
                  )}
                </div>

                <div className="sample-fee-card">
                  <div className="sample-fee-row">
                    <span>Sample Program Fee</span>
                    <strong>{formatCurrency(boxState?.sample_box.sample_fee ?? 300)}</strong>
                  </div>
                  <p>
                    Refundable once, automatically adjusted against your first eligible bulk order.
                  </p>
                  {boxState?.credit.available_amount ? (
                    <p className="sample-credit-note">
                      Available refundable credit: {formatCurrency(boxState.credit.available_amount)}
                      {boxState.credit.source_request_id ? ` (${boxState.credit.source_request_id})` : ""}
                    </p>
                  ) : boxState?.credit.already_used ? (
                    <p className="sample-credit-note">Sample credit already used on an earlier eligible bulk order.</p>
                  ) : null}
                </div>

                {error ? <p className="form-error">{error}</p> : null}
                {message ? <p className="sample-success-note">{message}</p> : null}

                <div className="sample-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!boxState?.sample_box.items.length || submitting}
                    onClick={submitSampleRequest}
                  >
                    {submitting ? "Submitting..." : "Submit Sample Request"}
                  </button>
                  <Link href="/account/sample-requests" className="btn">
                    Track Sample Requests
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
