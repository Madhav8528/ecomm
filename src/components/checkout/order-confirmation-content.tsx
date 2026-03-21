"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type OrderItem = {
  product_name: string;
  quantity: number;
  line_total: string | number;
  closure_name?: string;
};

type OrderDetail = {
  order_id: string;
  status: string;
  cancellation_reason?: string;
  created_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  payment_method: string;
  grand_total: string | number;
  items: OrderItem[];
  billing_name: string;
  billing_address_line1: string;
  billing_address_line2?: string;
  billing_city: string;
  billing_state: string;
  billing_pin: string;
  billing_phone: string;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pin: string;
  shipping_phone: string;
  transport_name?: string;
  transport_contact?: string;
  lr_number?: string;
  estimated_delivery?: string;
  lr_copy?: string;
  invoice_file?: string;
};

async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

const STATUS_STEPS: {
  key: string;
  label: string;
  description: string | null;
  icon: ReactNode;
}[] = [
  {
    key: "order_received",
    label: "Order Received",
    description: "Your order has been received. Our team will review and confirm within 1 business day.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 5h14M3 10h14M3 15h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "awaiting",
    label: "Awaiting Confirmation",
    description: "Our team is reviewing your order. You will be notified once it is confirmed.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    description:
      "Confirmed by our team. Stock is reserved and your order is being packed and quality checked before dispatch.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "shipped",
    label: "Dispatched",
    description: "Your order has been dispatched. Transport details and documents are available below.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 8h10v7H1zM11 10h4l3 3v2h-7v-5z" strokeLinejoin="round" />
        <circle cx="4.5" cy="15.5" r="1.5" />
        <circle cx="14.5" cy="15.5" r="1.5" />
      </svg>
    ),
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order successfully delivered and confirmed.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 2l2.4 5H18l-4.2 3.1 1.6 5L10 12.3 4.6 15.1l1.6-5L2 7h5.6z" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function getStepIndex(status: string): number {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, number> = {
    order_received: 1,
    confirmed: 2,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };
  return map[s] ?? 1;
}

function getStepTimestamp(order: OrderDetail, key: string): string | null {
  const map: Record<string, string | undefined> = {
    order_received: order.created_at,
    awaiting: order.created_at,
    confirmed: order.confirmed_at,
    shipped: order.shipped_at,
    delivered: order.delivered_at,
  };
  const val = map[key];
  if (!val) return null;
  return new Date(val).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderConfirmationContent({ orderId }: { orderId: string }) {
  const params = useParams<{ orderId?: string | string[] }>();
  const resolvedOrderId = useMemo(() => {
    if (orderId && orderId !== "undefined" && orderId !== "null") return orderId;
    const fallback = params?.orderId;
    if (typeof fallback === "string") return fallback;
    if (Array.isArray(fallback)) return fallback[0] ?? "";
    return "";
  }, [orderId, params]);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (!resolvedOrderId) {
      setError("Order ID is missing. Please check the link or view your orders.");
      return () => {
        isMounted = false;
      };
    }
    apiGet<OrderDetail>(`/api/checkout/order-confirmation/${resolvedOrderId}`)
      .catch(() => apiGet<OrderDetail>(`/api/account/orders/${resolvedOrderId}/detail`))
      .then((data) => {
        if (isMounted) setOrder(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load order.");
      });
    return () => {
      isMounted = false;
    };
  }, [resolvedOrderId]);

  if (error) {
    return (
      <div className="card">
        <p className="form-error">{error}</p>
        <Link href="/account" className="btn btn-primary" style={{ marginTop: "0.8rem" }}>
          View My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirm-loading">
        <div className="order-confirm-spinner" />
        <p className="muted">Loading your order details...</p>
      </div>
    );
  }

  const normalisedStatus = order.status.toLowerCase().replace(/\s+/g, "_");
  const isCancelled = normalisedStatus === "cancelled";
  const activeStep = getStepIndex(order.status);
  const isDispatched = normalisedStatus === "shipped" || normalisedStatus === "delivered";
  const supportSubject = encodeURIComponent(`Order Query: #${order.order_id}`);

  return (
    <div className="order-confirm-page">
      <div className="order-confirm-back">
        <a href="/account" className="order-confirm-back-link">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to My Orders
        </a>
      </div>
      <div className={`order-confirm-hero ${isCancelled ? "cancelled" : ""}`}>
        <div className="order-confirm-hero-icon">
          {isCancelled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="order-confirm-hero-body">
          <h2>{isCancelled ? "Order Cancelled" : "Order Placed Successfully!"}</h2>
          <p className="order-confirm-hero-sub">
            Order <strong>#{order.order_id}</strong> -
            {new Date(order.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {isCancelled ? (
            order.cancellation_reason ? (
              <div className="order-cancel-reason">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3M8 11v.5" strokeLinecap="round" />
                </svg>
                <div>
                  <span className="order-cancel-reason-label">Reason for cancellation</span>
                  <p className="order-cancel-reason-text">{order.cancellation_reason}</p>
                </div>
              </div>
            ) : (
              <p className="order-confirm-hero-note" style={{ color: "#c0392b" }}>
                This order was cancelled. Please contact support if you have questions.
              </p>
            )
          ) : (
            <p className="order-confirm-hero-note">
              Our team will review and confirm your order within 1 business day. You'll receive updates as your order progresses.
            </p>
          )}
        </div>
      </div>

      {!isCancelled && (
        <div className="card order-stepper-card">
          <p className="order-section-eyebrow">Order Status</p>
          <div className="order-stepper">
            {STATUS_STEPS.map((step, index) => {
              const isDone = index < activeStep;
              const isActive = index === activeStep;
              const isPending = index > activeStep;
              const timestamp = getStepTimestamp(order, step.key);
              return (
                <div
                  key={step.key}
                  className={`order-step ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isPending ? "pending" : ""}`}
                >
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`order-step-line ${isDone ? "done" : ""}`} />
                  )}
                  <div className="order-step-circle">
                    {isDone ? (
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="order-step-label">
                    <span className="order-step-name">{step.label}</span>
                    {(isDone || isActive) && timestamp && (
                      <span className="order-step-time">{timestamp}</span>
                    )}
                    {isActive && step.description && (
                      <span className="order-step-desc">{step.description}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isDispatched && (
        <div className="card order-dispatch-card">
          <p className="order-section-eyebrow">Dispatch Details</p>
          <div className="order-dispatch-meta">
            {order.transport_name && (
              <div className="order-dispatch-meta-item">
                <span className="order-dispatch-meta-label">Transport Company</span>
                <strong>{order.transport_name}</strong>
              </div>
            )}
            {order.transport_contact && (
              <div className="order-dispatch-meta-item">
                <span className="order-dispatch-meta-label">Transport Contact</span>
                <strong>{order.transport_contact}</strong>
              </div>
            )}
            {order.lr_number && (
              <div className="order-dispatch-meta-item">
                <span className="order-dispatch-meta-label">LR Number</span>
                <strong>{order.lr_number}</strong>
              </div>
            )}
            {order.estimated_delivery && (
              <div className="order-dispatch-meta-item">
                <span className="order-dispatch-meta-label">Est. Delivery</span>
                <strong>{order.estimated_delivery}</strong>
              </div>
            )}
          </div>

          {(order.lr_copy || order.invoice_file) && (
            <div className="order-dispatch-docs">
              <p className="order-dispatch-docs-heading">Documents</p>
              <div className="order-dispatch-docs-grid">
                {order.lr_copy && (
                  <div className="order-dispatch-doc">
                    <div className="order-dispatch-doc-icon">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M4 4h8l4 4v8H4V4z" strokeLinejoin="round" />
                        <path d="M12 4v4h4M7 10h6M7 13h4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="order-dispatch-doc-info">
                      <span className="order-dispatch-doc-label">LR Copy</span>
                      <a
                        href={order.lr_copy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="order-dispatch-doc-link"
                      >
                        Download
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 3v7M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 13h10" strokeLinecap="round" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {order.invoice_file && (
                  <div className="order-dispatch-doc">
                    <div className="order-dispatch-doc-icon">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M4 4h8l4 4v8H4V4z" strokeLinejoin="round" />
                        <path d="M12 4v4h4M7 10h6M7 13h4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="order-dispatch-doc-info">
                      <span className="order-dispatch-doc-label">Invoice / Bill</span>
                      <a
                        href={order.invoice_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="order-dispatch-doc-link"
                      >
                        Download
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 3v7M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 13h10" strokeLinecap="round" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card order-items-card">
        <p className="order-section-eyebrow">Items Ordered</p>
        <div className="order-items-list">
          {order.items.map((item, index) => (
            <div key={`${order.order_id}-${index}`} className="order-item-row">
              <span className="order-item-name">
                {item.product_name}
                {item.closure_name ? (
                  <span className="order-item-closure"> + {item.closure_name} closure</span>
                ) : null}
              </span>
              <span className="order-item-qty">x{item.quantity}</span>
              <span className="order-item-total">{formatCurrency(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="order-items-footer">
          <div className="order-total-row">
            <span>Payment Method</span>
            <strong>{order.payment_method}</strong>
          </div>
          <div className="order-total-row grand">
            <span>Grand Total</span>
            <strong className="order-grand-total">{formatCurrency(order.grand_total)}</strong>
          </div>
        </div>
      </div>

      <div className="order-address-grid">
        <div className="card order-address-card">
          <p className="order-section-eyebrow">Billing Address</p>
          <p className="order-address-name">{order.billing_name}</p>
          <p>{order.billing_address_line1}</p>
          {order.billing_address_line2 && <p>{order.billing_address_line2}</p>}
          <p>
            {order.billing_city}, {order.billing_state} - {order.billing_pin}
          </p>
          <p className="order-address-phone">{order.billing_phone}</p>
        </div>
        <div className="card order-address-card">
          <p className="order-section-eyebrow">Shipping Address</p>
          <p className="order-address-name">{order.shipping_name}</p>
          <p>{order.shipping_address_line1}</p>
          {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
          <p>
            {order.shipping_city}, {order.shipping_state} - {order.shipping_pin}
          </p>
          <p className="order-address-phone">{order.shipping_phone}</p>
        </div>
      </div>

      <div className="order-support-bar">
        <div className="order-support-text">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5M10 14v.5" strokeLinecap="round" />
          </svg>
          <div>
            <strong>Need help with this order?</strong>
            <p>Our team is available Mon-Sat, 10am-6pm IST</p>
          </div>
        </div>
        <div className="order-support-actions">
          <a
            href={`mailto:sales@clearpiece.com?subject=${supportSubject}`}
            className="btn order-support-btn"
          >
            Email Support
          </a>
          <a
            href="https://wa.me/919000012345"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary order-support-btn"
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      <div className="order-confirm-actions">
        <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        <Link href="/account" className="btn">View All Orders</Link>
      </div>
    </div>
  );
}
