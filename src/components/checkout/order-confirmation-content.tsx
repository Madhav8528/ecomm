"use client";

import { useEffect, useMemo, useState } from "react";
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
  created_at: string;
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
};

async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export function OrderConfirmationContent({ orderId }: { orderId: string }) {
  const params = useParams<{ orderId?: string | string[] }>();
  const resolvedOrderId = useMemo(() => {
    if (orderId && orderId !== "undefined" && orderId !== "null") {
      return orderId;
    }
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
      .then((data) => {
        if (!isMounted) return;
        setOrder(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load order.");
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
      <div className="card">
        <p className="muted">Loading order confirmation...</p>
      </div>
    );
  }

  const orderDateTime = order.created_at
    ? new Date(order.created_at).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isCancelled = order.status === "cancelled";

  return (
    <div className="card">
      <div className="success-box">
        <div className="success-check">✓</div>
        <h2>{isCancelled ? "Order Cancelled" : "Order Placed Successfully!"}</h2>
        <p className="muted">
          Order ID <strong>{order.order_id}</strong>
        </p>
        <p className="muted">Order Date: {orderDateTime}</p>
        {isCancelled ? (
          <p className="muted">
            Some items were unavailable at the time of confirmation. Please review your cart and try again.
          </p>
        ) : null}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h3>Items Ordered</h3>
        {order.items.map((item, index) => (
          <div key={`${order.order_id}-${index}`} className="summary-row">
            <span>
              {item.product_name} x{item.quantity}
              {item.closure_name ? ` (Closure: ${item.closure_name})` : ""}
            </span>
            <span>{formatCurrency(item.line_total)}</span>
          </div>
        ))}
      </div>

      <div className="split-layout" style={{ marginTop: "1rem" }}>
        <div className="card">
          <h4>Billing Address</h4>
          <p>{order.billing_name}</p>
          <p>{order.billing_address_line1}</p>
          {order.billing_address_line2 ? <p>{order.billing_address_line2}</p> : null}
          <p>
            {order.billing_city}, {order.billing_state} {order.billing_pin}
          </p>
          <p>{order.billing_phone}</p>
        </div>
        <div className="card">
          <h4>Shipping Address</h4>
          <p>{order.shipping_name}</p>
          <p>{order.shipping_address_line1}</p>
          {order.shipping_address_line2 ? <p>{order.shipping_address_line2}</p> : null}
          <p>
            {order.shipping_city}, {order.shipping_state} {order.shipping_pin}
          </p>
          <p>{order.shipping_phone}</p>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <p>
          Payment Method: <strong>{order.payment_method}</strong>
        </p>
        <p>
          Grand Total: <strong>{formatCurrency(order.grand_total)}</strong>
        </p>
        <p className="muted">Your order will be dispatched within 24-48 hours.</p>
      </div>

      <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
        <Link href="/account" className="btn">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
