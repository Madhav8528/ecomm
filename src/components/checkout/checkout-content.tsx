"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

type Profile = {
  full_name: string;
  email: string;
  phone: string;
};

type Billing = {
  billing_full_name: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_pin: string;
  billing_phone: string;
  business_name: string;
  business_type: string;
  gst_number: string;
};

type Address = {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pin_code: string;
  is_default: boolean;
};

type NormalizedItem = {
  product_id: number;
  product_name: string;
  unit_price: number;
  price_unit?: "per_piece" | "per_set";
  set_size?: number;
  quantity: number;
  packaging_mode?: "brown_box" | "gift_box";
  closure_name?: string;
  closure_price?: number;
  line_total: number;
};

type CartTotals = {
  subtotal: number;
  gst_amount: number;
  grand_total: number;
  sample_credit_adjustment?: number;
  adjusted_grand_total?: number;
  sample_credit_source_request?: string;
  meets_minimum: boolean;
  cod_available: boolean;
};

type CheckoutDraft = {
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  billing: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
  };
  shipping: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
  };
  business: {
    name: string;
    type: string;
    gst: string;
  };
  sameAsBilling: boolean;
  selectedAddressId: number | "";
};

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const CHECKOUT_DRAFT_KEY = "guru-checkout-draft-v1";
const CART_STOCK_NOTICE_KEY = "clearpiece-cart-stock-notice-v1";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const STOCK_ERROR_REGEX = /Only\s+(\d+)\s+units?\s+available(?:\s+for\s+(.+?))?/i;

function normalizeGst(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function getCartStockNotice(errorMessage: string) {
  const match = errorMessage.match(STOCK_ERROR_REGEX);
  if (!match) return null;
  const units = Number(match[1]);
  if (!Number.isFinite(units)) return "Some items in your cart are no longer available in the requested quantity.";
  return `Only ${units} units are currently available. Please update quantity in your cart.`;
}

function validateBusinessDetails(business: { name: string; gst: string }) {
  const gst = normalizeGst(business.gst ?? "");
  const name = business.name.trim();

  if (!gst) {
    return "GST number is required to place an order.";
  }
  if (!name) {
    return "Business name is required for GST invoices.";
  }
  if (gst && !GST_REGEX.test(gst)) {
    return "Enter a valid GSTIN (15 characters).";
  }
  return "";
}

async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

async function apiPost<T>(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export function CheckoutContent() {
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [billing, setBilling] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    phone: "",
  });
  const [shipping, setShipping] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    phone: "",
  });
  const [business, setBusiness] = useState({
    name: "",
    type: "",
    gst: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "">("");

  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [totals, setTotals] = useState<CartTotals | null>(null);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const draftRef = useRef<CheckoutDraft | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  const redirectToCartForStockIssue = useCallback((errorMessage: string) => {
    const notice = getCartStockNotice(errorMessage);
    if (!notice) return false;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(CART_STOCK_NOTICE_KEY, notice);
    }
    router.push("/cart");
    return true;
  }, [router]);

  const normalizedItems = useMemo<NormalizedItem[]>(() => {
    const productItems = items.filter((item) => item.categorySlug !== "closures");
    const closureItems = items.filter((item) => item.categorySlug === "closures");

    return productItems
      .map((item) => {
        const productId = Number(item.id);
        if (!Number.isFinite(productId)) return null;
        const closure = closureItems.find((closureItem) => closureItem.slug === item.slug);
        const closureName = closure?.name?.replace(/\s*\(Closure\)$/i, "") ?? "";
        const closurePrice = closure?.price ?? 0;
        const setSize = Math.max(1, item.setSize ?? 6);
        const productLineTotal =
          item.priceUnit === "per_set"
            ? (item.price * item.quantity) / setSize
            : item.price * item.quantity;
        const lineTotal = productLineTotal + closurePrice * item.quantity;
        return {
          product_id: productId,
          product_name: item.name,
          unit_price: item.price,
          price_unit: item.priceUnit,
          set_size: item.setSize,
          quantity: item.quantity,
          packaging_mode: item.packagingMode,
          closure_name: closureName || undefined,
          closure_price: closurePrice || 0,
          line_total: lineTotal,
        } as NormalizedItem;
      })
      .filter((item): item is NormalizedItem => Boolean(item));
  }, [items]);

  const computedSubtotal = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.line_total, 0),
    [normalizedItems],
  );
  const computedGst = computedSubtotal * 0.18;
  const computedGrandTotal = computedSubtotal + computedGst;
  const sampleCreditAdjustment = totals?.sample_credit_adjustment ?? 0;
  const adjustedGrandTotal = totals?.adjusted_grand_total ?? computedGrandTotal;

  const meetsMinimum = totals?.meets_minimum ?? computedSubtotal >= 8000;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CheckoutDraft;
        draftRef.current = parsed;
        if (parsed.contact) setContact(parsed.contact);
        if (parsed.billing) setBilling(parsed.billing);
        if (parsed.shipping) setShipping(parsed.shipping);
        if (parsed.business) setBusiness(parsed.business);
        if (typeof parsed.sameAsBilling === "boolean") setSameAsBilling(parsed.sameAsBilling);
        if (parsed.selectedAddressId !== undefined) setSelectedAddressId(parsed.selectedAddressId);
      } catch {
        draftRef.current = null;
      }
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady || typeof window === "undefined") return;
    const draft: CheckoutDraft = {
      contact,
      billing,
      shipping,
      business,
      sameAsBilling,
      selectedAddressId,
    };
    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [contact, billing, shipping, business, sameAsBilling, selectedAddressId, draftReady]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await apiGet<Profile>("/api/account/profile/");
        if (!isMounted) return;
        const draft = draftRef.current;
        setContact({
          name: draft?.contact?.name ?? profile.full_name ?? "",
          email: draft?.contact?.email ?? profile.email ?? "",
          phone: draft?.contact?.phone ?? profile.phone ?? "",
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      }
    };

    const loadBilling = async () => {
      try {
        const data = await apiGet<Billing>("/api/account/billing/");
        if (!isMounted) return;
        const draft = draftRef.current;
        setBilling({
          name: draft?.billing?.name ?? data.billing_full_name ?? "",
          line1: draft?.billing?.line1 ?? data.billing_address_line1 ?? "",
          line2: draft?.billing?.line2 ?? data.billing_address_line2 ?? "",
          city: draft?.billing?.city ?? data.billing_city ?? "",
          state: draft?.billing?.state ?? data.billing_state ?? "",
          pin: draft?.billing?.pin ?? data.billing_pin ?? "",
          phone: draft?.billing?.phone ?? data.billing_phone ?? "",
        });
        setBusiness({
          name: draft?.business?.name ?? data.business_name ?? "",
          type: draft?.business?.type ?? data.business_type ?? "",
          gst: draft?.business?.gst ?? data.gst_number ?? "",
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load billing.");
      }
    };

    const loadAddresses = async () => {
      try {
        const data = await apiGet<Address[] | { results?: Address[] }>("/api/account/addresses/");
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setAddresses(list);
        const defaultAddress = list.find((address) => address.is_default);
        const draft = draftRef.current;
        if (draft?.selectedAddressId) {
          setSelectedAddressId(draft.selectedAddressId);
          if (draft?.billing) {
            setBilling(draft.billing);
          }
        } else if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          if (!draft?.billing) {
            setBilling({
              name: defaultAddress.full_name,
              line1: defaultAddress.address_line1,
              line2: defaultAddress.address_line2 ?? "",
              city: defaultAddress.city,
              state: defaultAddress.state,
              pin: defaultAddress.pin_code,
              phone: defaultAddress.phone,
            });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load addresses.");
      }
    };

    if (draftReady) {
      void loadProfile();
      void loadBilling();
      void loadAddresses();
    }

    return () => {
      isMounted = false;
    };
  }, [draftReady]);

  useEffect(() => {
    if (!sameAsBilling) return;
    setShipping({
      name: billing.name,
      line1: billing.line1,
      line2: billing.line2,
      city: billing.city,
      state: billing.state,
      pin: billing.pin,
      phone: billing.phone,
    });
  }, [sameAsBilling, billing]);

  useEffect(() => {
    if (!business.gst) return;
    const gst = normalizeGst(business.gst ?? "");
    if (gst !== business.gst) {
      setBusiness((prev) => ({ ...prev, gst }));
    }
  }, [business.gst]);

  useEffect(() => {
    let isMounted = true;
    if (!normalizedItems.length) {
      setTotals(null);
      return;
    }
    setLoadingTotals(true);

    apiPost<CartTotals>("/api/checkout/validate-cart", {
      items: normalizedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        packaging_mode: item.packaging_mode,
        closure_name: item.closure_name,
        closure_price: item.closure_price,
      })),
    })
      .then((data) => {
        if (!isMounted) return;
        setTotals(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Unable to validate cart.";
        if (redirectToCartForStockIssue(message)) return;
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingTotals(false);
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedItems, redirectToCartForStockIssue]);

  useEffect(() => {
    if (!selectedAddressId) return;
    const selected = addresses.find((address) => address.id === selectedAddressId);
    if (!selected) return;
    setBilling({
      name: selected.full_name,
      line1: selected.address_line1,
      line2: selected.address_line2 ?? "",
      city: selected.city,
      state: selected.state,
      pin: selected.pin_code,
      phone: selected.phone,
    });
  }, [selectedAddressId, addresses]);

  if (!items.length) {
    return (
      <div className="card empty-state">
        <h3>Checkout is empty</h3>
        <p className="muted" style={{ marginTop: "0.4rem" }}>
          Add products to cart before placing an order.
        </p>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: "0.85rem" }}>
          Go to Products
        </Link>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!meetsMinimum || !normalizedItems.length) return;

    const businessError = validateBusinessDetails(business);
    if (businessError) {
      setError(businessError);
      return;
    }
    if (!humanVerified) {
      setError("Please confirm you are not a robot before placing your order.");
      return;
    }
    if (!acceptPolicies) {
      setError("Please accept Terms & Conditions and Privacy Policy before placing your order.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const orderResponse = await apiPost<{ order_id: string }>("/api/checkout/create-order", {
        payment_method: "online",
        human_verified: true,
        recaptcha_token: "",
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
        billing_name: billing.name,
        billing_address_line1: billing.line1,
        billing_address_line2: billing.line2,
        billing_city: billing.city,
        billing_state: billing.state,
        billing_pin: billing.pin,
        billing_phone: billing.phone,
        shipping_name: shipping.name,
        shipping_address_line1: shipping.line1,
        shipping_address_line2: shipping.line2,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_pin: shipping.pin,
        shipping_phone: shipping.phone,
        business_name: business.name.trim(),
        business_type: business.type,
        gst_number: normalizeGst(business.gst ?? ""),
        items: normalizedItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          packaging_mode: item.packaging_mode,
          closure_name: item.closure_name,
          closure_price: item.closure_price,
        })),
      });
      const orderId = orderResponse.order_id;

      if (!orderId) {
        throw new Error("Unable to create order.");
      }

      clearCart();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      }
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to place order.";
      if (redirectToCartForStockIssue(message)) return;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const normalize = (value: string) => value.trim();
  const isValidPhone = (value: string) => /^[0-9]{10}$/.test(normalize(value));
  const isValidPin = (value: string) => /^[0-9]{6}$/.test(normalize(value));
  const isValidState = (value: string) => INDIA_STATES.includes(normalize(value));

  const shippingSnapshot = sameAsBilling ? billing : shipping;

  const isFormValid =
    normalize(contact.name) &&
    normalize(contact.email) &&
    isValidPhone(contact.phone) &&
    normalize(billing.name) &&
    normalize(billing.line1) &&
    normalize(billing.city) &&
    isValidState(billing.state) &&
    isValidPin(billing.pin) &&
    isValidPhone(billing.phone) &&
    normalize(shippingSnapshot.name) &&
    normalize(shippingSnapshot.line1) &&
    normalize(shippingSnapshot.city) &&
    isValidState(shippingSnapshot.state) &&
    isValidPin(shippingSnapshot.pin) &&
    isValidPhone(shippingSnapshot.phone) &&
    normalize(business.name) &&
    normalize(business.gst);

  const missingFields: string[] = [];
  if (!normalize(contact.name)) missingFields.push("contact name");
  if (!normalize(contact.email)) missingFields.push("contact email");
  if (normalize(contact.phone) && !isValidPhone(contact.phone)) missingFields.push("contact phone");
  if (!normalize(billing.name)) missingFields.push("billing name");
  if (!normalize(billing.line1)) missingFields.push("billing address");
  if (!normalize(billing.city)) missingFields.push("billing city");
  if (normalize(billing.state) && !isValidState(billing.state)) missingFields.push("billing state");
  if (normalize(billing.pin) && !isValidPin(billing.pin)) missingFields.push("billing PIN");
  if (normalize(billing.phone) && !isValidPhone(billing.phone)) missingFields.push("billing phone");
  if (!normalize(shippingSnapshot.name)) missingFields.push("shipping name");
  if (!normalize(shippingSnapshot.line1)) missingFields.push("shipping address");
  if (!normalize(shippingSnapshot.city)) missingFields.push("shipping city");
  if (normalize(shippingSnapshot.state) && !isValidState(shippingSnapshot.state))
    missingFields.push("shipping state");
  if (normalize(shippingSnapshot.pin) && !isValidPin(shippingSnapshot.pin))
    missingFields.push("shipping PIN");
  if (normalize(shippingSnapshot.phone) && !isValidPhone(shippingSnapshot.phone))
    missingFields.push("shipping phone");
  if (!normalize(business.name)) missingFields.push("business name");
  if (!normalize(business.gst)) missingFields.push("GST number");

  const subtotalForMinimum = totals?.subtotal ?? computedSubtotal;
  const disableReason = !meetsMinimum
    ? `Minimum order value is ${formatCurrency(8000)} before GST. Current subtotal: ${formatCurrency(
        subtotalForMinimum,
      )}. Add more items to proceed.`
    : !isFormValid
      ? `Please check: ${missingFields.join(", ")}.`
      : !humanVerified
        ? "Please confirm 'I am not a robot' to continue."
        : !acceptPolicies
          ? "Please accept Terms & Conditions and Privacy Policy to continue."
      : "";

  return (
    <div className="split-layout">
      <div className="card">
        <h3>Contact Information</h3>
        <div className="form-grid" style={{ marginTop: "0.85rem" }}>
          <div className="form-row">
            <label>Full Name</label>
            <input
              value={contact.name}
              onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Mobile Number</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(event) =>
                setContact((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "") }))
              }
              required
              inputMode="tel"
              maxLength={10}
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.4rem" }}>Billing Address</h3>
        <div style={{ marginTop: "0.4rem" }}>
          <label className="form-row">
            <span>Select saved address for billing</span>
            <select
              value={selectedAddressId}
              onChange={(event) => setSelectedAddressId(event.target.value ? Number(event.target.value) : "")}
            >
              <option value="">Select saved address</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label} - {address.city}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid" style={{ marginTop: "0.85rem" }}>
          <div className="form-row">
            <label>Billing Name</label>
            <input
              value={billing.name}
              onChange={(event) => setBilling((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Address Line 1</label>
            <input
              value={billing.line1}
              onChange={(event) => setBilling((prev) => ({ ...prev, line1: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Address Line 2</label>
            <input
              value={billing.line2}
              onChange={(event) => setBilling((prev) => ({ ...prev, line2: event.target.value }))}
            />
          </div>
          <div className="form-row">
            <label>City</label>
            <input
              value={billing.city}
              onChange={(event) => setBilling((prev) => ({ ...prev, city: event.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>State</label>
            <select
              value={billing.state}
              onChange={(event) => setBilling((prev) => ({ ...prev, state: event.target.value }))}
              required
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>PIN</label>
            <input
              value={billing.pin}
              onChange={(event) =>
                setBilling((prev) => ({ ...prev, pin: event.target.value.replace(/\D/g, "") }))
              }
              required
              inputMode="numeric"
              maxLength={6}
            />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input
              value={billing.phone}
              onChange={(event) =>
                setBilling((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "") }))
              }
              required
              inputMode="tel"
              maxLength={10}
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.4rem" }}>Shipping Address</h3>
        <div style={{ marginTop: "0.4rem" }}>
          <label className="toggle-item" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
            <span>Shipping address is same as billing address</span>
            <span>
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(event) => setSameAsBilling(event.target.checked)}
              />
              <span className="toggle-slider" />
            </span>
          </label>
        </div>
        <div className="form-grid" style={{ marginTop: "0.85rem" }}>
          <div className="form-row">
            <label>Full Name</label>
            <input
              value={shipping.name}
              onChange={(event) => setShipping((prev) => ({ ...prev, name: event.target.value }))}
              required
              readOnly={sameAsBilling}
            />
          </div>
          <div className="form-row">
            <label>Address Line 1</label>
            <input
              value={shipping.line1}
              onChange={(event) => setShipping((prev) => ({ ...prev, line1: event.target.value }))}
              required
              readOnly={sameAsBilling}
            />
          </div>
          <div className="form-row">
            <label>Address Line 2</label>
            <input
              value={shipping.line2}
              onChange={(event) => setShipping((prev) => ({ ...prev, line2: event.target.value }))}
              readOnly={sameAsBilling}
            />
          </div>
          <div className="form-row">
            <label>City</label>
            <input
              value={shipping.city}
              onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
              required
              readOnly={sameAsBilling}
            />
          </div>
          <div className="form-row">
            <label>State</label>
            <select
              value={shipping.state}
              onChange={(event) => setShipping((prev) => ({ ...prev, state: event.target.value }))}
              required
              disabled={sameAsBilling}
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>PIN</label>
            <input
              value={shipping.pin}
              onChange={(event) =>
                setShipping((prev) => ({ ...prev, pin: event.target.value.replace(/\D/g, "") }))
              }
              required
              readOnly={sameAsBilling}
              inputMode="numeric"
              maxLength={6}
            />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input
              value={shipping.phone}
              onChange={(event) =>
                setShipping((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "") }))
              }
              required
              readOnly={sameAsBilling}
              inputMode="tel"
              maxLength={10}
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.4rem" }}>Business & GST Details</h3>
        <div className="form-grid" style={{ marginTop: "0.85rem" }}>
          <div className="form-row">
            <label>Business Name</label>
            <input
              value={business.name}
              onChange={(event) => setBusiness((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="form-row">
            <label>Business Type</label>
            <input
              value={business.type}
              onChange={(event) => setBusiness((prev) => ({ ...prev, type: event.target.value }))}
            />
          </div>
          <div className="form-row">
            <label>GST Number</label>
            <input
              value={business.gst}
              onChange={(event) =>
                setBusiness((prev) => ({ ...prev, gst: normalizeGst(event.target.value) }))
              }
              maxLength={15}
            />
          </div>
        </div>
        <p className="muted" style={{ marginTop: "0.4rem" }}>
          Business name should match your GST registration. GST details will appear on your invoice.
        </p>
      </div>

      <aside className="card summary-block">
        <h3>Order Summary</h3>
        {normalizedItems.map((item) => (
          <div key={item.product_id} className="summary-row">
            <span>
              {item.product_name} x{item.quantity}
              {item.closure_name ? ` (Closure: ${item.closure_name})` : ""}
            </span>
            <span>{formatCurrency(item.line_total)}</span>
          </div>
        ))}
        <div className="summary-row">
          <span className="muted">Subtotal</span>
          <span>{formatCurrency(totals?.subtotal ?? computedSubtotal)}</span>
        </div>
        <div className="summary-row">
          <span className="muted">GST @ 18%</span>
          <span>{formatCurrency(totals?.gst_amount ?? computedGst)}</span>
        </div>
        {sampleCreditAdjustment > 0 ? (
          <div className="summary-row">
            <span className="muted">
              Sample Fee Adjustment
              {totals?.sample_credit_source_request ? ` (${totals.sample_credit_source_request})` : ""}
            </span>
            <span>-{formatCurrency(sampleCreditAdjustment)}</span>
          </div>
        ) : null}
        <div className="summary-row summary-total">
          <span>Grand Total</span>
          <span>{formatCurrency(adjustedGrandTotal)}</span>
        </div>
        <Link href="/cart" className="btn" style={{ marginTop: "0.6rem" }}>
          Edit Cart
        </Link>

        <h3 style={{ marginTop: "1.2rem" }}>Payment</h3>
        <div className="card" style={{ marginTop: "0.6rem" }}>
          <p className="muted">
            Payment options will be available after order confirmation. Our team usually confirms within 1 working day.
          </p>
        </div>
        <label className="toggle-item" style={{ justifyContent: "flex-start", gap: "0.75rem", marginTop: "0.8rem" }}>
          <span>I am not a robot</span>
          <span>
            <input type="checkbox" checked={humanVerified} onChange={(event) => setHumanVerified(event.target.checked)} />
            <span className="toggle-slider" />
          </span>
        </label>
        <label className="contact-policy-consent" style={{ marginTop: "0.75rem" }}>
          <input
            type="checkbox"
            checked={acceptPolicies}
            onChange={(event) => setAcceptPolicies(event.target.checked)}
          />
          <span>
            I have read and agree to the <Link href="/terms-and-conditions">Terms & Conditions</Link> and{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </span>
        </label>

        {disableReason ? (
          <p className="form-error" style={{ marginTop: "0.8rem" }}>
            {disableReason}
          </p>
        ) : null}

        {error ? (
          <p className="form-error" style={{ marginTop: "0.6rem" }}>
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
          disabled={!isFormValid || !meetsMinimum || !humanVerified || !acceptPolicies || submitting || loadingTotals}
          onClick={handlePlaceOrder}
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </aside>
    </div>
  );
}

