"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SampleRequestItem = {
  product_name: string;
  product_sku: string;
  quantity: number;
};

type SampleRequest = {
  request_id: string;
  status: string;
  fee_status: string;
  sample_fee: string | number;
  created_at: string;
  shipping_name: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pin: string;
  items: SampleRequestItem[];
};

function statusLabel(status: string) {
  return (status || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function statusClass(status: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "delivered") return "delivered";
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "shipped" || normalized === "packed") return "shipped";
  return "processing";
}

export function SampleRequestsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<SampleRequest[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/sample/requests", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as
          | SampleRequest[]
          | { results?: SampleRequest[]; error?: string; detail?: string };
        if (!response.ok) {
          const message = (payload as { error?: string; detail?: string }).error
            || (payload as { error?: string; detail?: string }).detail
            || "Unable to load sample requests.";
          throw new Error(message);
        }
        return Array.isArray(payload) ? payload : (payload.results ?? []);
      })
      .then((data) => {
        if (!isMounted) return;
        setRequests(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load sample requests.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalUnits = useMemo(() => {
    return requests.reduce(
      (acc, request) => acc + request.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      0,
    );
  }, [requests]);

  return (
    <section className="section">
      <div className="container">
        <header className="section-title-row">
          <h1 className="section-title">Sample Requests</h1>
          <p className="section-note">
            Track submitted sample boxes and fee adjustment eligibility.
          </p>
        </header>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="muted">
            Total sample requests: <strong>{requests.length}</strong> | Total sample units requested: <strong>{totalUnits}</strong>
          </p>
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            Sample fee is ₹300 per request. Refund adjustment is automatic and one-time against the first eligible bulk order.
          </p>
        </div>

        {loading ? <div className="skeleton-grid" /> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {!loading && !error && !requests.length ? (
          <div className="card empty-state">
            <h3>No sample requests yet</h3>
            <p className="muted" style={{ marginTop: "0.45rem" }}>
              Start from any product page using the Request Sample drawer.
            </p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: "0.8rem", display: "inline-block" }}>
              Browse Products
            </Link>
          </div>
        ) : null}

        {!loading && !error && requests.length ? (
          <div className="order-list">
            {requests.map((request) => (
              <article key={request.request_id} className="card order-card">
                <div className="order-card-top">
                  <div>
                    <h3>{request.request_id}</h3>
                    <p className="muted">
                      Submitted {new Date(request.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="order-statuses">
                    <span className={`status-badge ${statusClass(request.status)}`}>
                      {statusLabel(request.status)}
                    </span>
                    <span className={`status-badge ${request.fee_status === "adjusted" ? "delivered" : "processing"}`}>
                      Fee {statusLabel(request.fee_status)}
                    </span>
                  </div>
                </div>

                <div className="order-item-list">
                  {request.items.map((item) => (
                    <div key={`${request.request_id}-${item.product_sku}`} className="order-item-row">
                      <span>{item.product_name} ({item.product_sku})</span>
                      <strong>x{item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-meta-grid">
                  <div>
                    <span className="muted">Fee</span>
                    <strong>₹{request.sample_fee}</strong>
                  </div>
                  <div>
                    <span className="muted">Ship To</span>
                    <strong>{request.shipping_name}</strong>
                  </div>
                  <div>
                    <span className="muted">City/State</span>
                    <strong>{request.shipping_city}, {request.shipping_state}</strong>
                  </div>
                  <div>
                    <span className="muted">PIN</span>
                    <strong>{request.shipping_pin}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
