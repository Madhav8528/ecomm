
"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { formatCurrency as formatMoney } from "@/lib/format";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "My Profile" },
  { id: "password", label: "Change Password" },
  { id: "orders", label: "My Orders" },
  { id: "billing", label: "Billing & Business Details" },
  { id: "addresses", label: "Saved Addresses" },
  { id: "notifications", label: "Notifications & Preferences" },
  { id: "logout", label: "Logout" },
] as const;

type MenuId = (typeof MENU_ITEMS)[number]["id"];

type DashboardSummary = {
  total_orders: number;
  pending_orders: number;
  saved_addresses: number;
  profile_completion: number;
  recent_orders: Array<{
    order_id: string;
    date: string;
    status: string;
    amount: string | number;
  }>;
};

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
};

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
  closure_name?: string;
  closure_price?: string | number;
};

type Order = {
  id: number;
  order_id: string;
  created_at: string;
  status: string;
  payment_status?: string;
  grand_total: string | number;
  items: OrderItem[];
  shipping_address_line1: string;
  shipping_city: string;
  shipping_pin: string;
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

type Notifications = {
  email_order_updates: boolean;
  sms_order_updates: boolean;
  restock_alerts: boolean;
  new_product_alerts: boolean;
};

const BUSINESS_TYPES = [
  "Manufacturer",
  "Retailer",
  "Distributor",
  "Wholesaler",
  "Other",
];

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

const BILLING_DRAFT_KEY = "guru-billing-draft-v1";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function normalizeGst(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function formatCurrency(value: string | number | undefined) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return formatMoney(0);
  return formatMoney(num);
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === "pending_payment") return "processing";
  if (value === "confirmed") return "processing";
  if (value === "paid") return "paid";
  if (value === "pending") return "processing";
  if (value === "processing") return "processing";
  if (value === "shipped") return "shipped";
  if (value === "delivered") return "delivered";
  if (value === "cancelled" || value === "canceled") return "cancelled";
  return "processing";
}

function orderStatusLabel(status: string) {
  if (!status) return "Processing";
  if (status === "pending_payment") return "Pending Payment";
  if (status === "confirmed") return "Confirmed";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

async function apiSend<T>(url: string, method: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? payload.detail ?? payload.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export function AccountDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [active, setActive] = useState<MenuId>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [billingForm, setBillingForm] = useState<Billing>({
    billing_full_name: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state: "",
    billing_pin: "",
    billing_phone: "",
    business_name: "",
    business_type: "",
    gst_number: "",
  });
  const billingDraftLoadedRef = useRef(false);
  const [billingDraftReady, setBillingDraftReady] = useState(false);
  const [gstLookupLoading, setGstLookupLoading] = useState(false);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pin_code: "",
    is_default: false,
  });

  const [notificationForm, setNotificationForm] = useState<Notifications>({
    email_order_updates: true,
    sms_order_updates: true,
    restock_alerts: false,
    new_product_alerts: false,
  });

  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(BILLING_DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Billing>;
        setBillingForm((prev) => ({
          ...prev,
          ...parsed,
        }));
        billingDraftLoadedRef.current = true;
      } catch {
        billingDraftLoadedRef.current = false;
      }
    }
    setBillingDraftReady(true);
  }, []);

  useEffect(() => {
    if (!billingDraftReady || typeof window === "undefined") return;
    window.sessionStorage.setItem(BILLING_DRAFT_KEY, JSON.stringify(billingForm));
  }, [billingForm, billingDraftReady]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await apiGet<Profile>("/api/account/profile/");
        if (!isMounted) return;
        setProfile(data);
        setProfileForm({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (active === "dashboard") {
          const data = await apiGet<DashboardSummary>("/api/account/dashboard/summary/");
          if (!isMounted) return;
          setSummary(data);
        }

        if (active === "profile" || active === "password") {
          const data = await apiGet<Profile>("/api/account/profile/");
          if (!isMounted) return;
          setProfile(data);
          setProfileForm({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
          });
        }

        if (active === "orders") {
          const data = await apiGet<Order[] | { results?: Order[] }>("/api/account/orders/");
          if (!isMounted) return;
          const list = Array.isArray(data) ? data : data?.results ?? [];
          setOrders(list);
        }

        if (active === "billing") {
          const data = await apiGet<Billing>("/api/account/billing/");
          if (!isMounted) return;
          if (!billingDraftLoadedRef.current) {
            setBillingForm({
              billing_full_name: data.billing_full_name ?? "",
              billing_address_line1: data.billing_address_line1 ?? "",
              billing_address_line2: data.billing_address_line2 ?? "",
              billing_city: data.billing_city ?? "",
              billing_state: data.billing_state ?? "",
              billing_pin: data.billing_pin ?? "",
              billing_phone: data.billing_phone ?? "",
              business_name: data.business_name ?? "",
              business_type: data.business_type ?? "",
              gst_number: data.gst_number ?? "",
            });
          }
        }

        if (active === "addresses") {
          const data = await apiGet<Address[] | { results?: Address[] }>("/api/account/addresses/");
          if (!isMounted) return;
          const list = Array.isArray(data) ? data : data?.results ?? [];
          setAddresses(list);
        }

        if (active === "notifications") {
          const data = await apiGet<Notifications>("/api/account/notifications/");
          if (!isMounted) return;
          setNotificationForm({
            email_order_updates: data.email_order_updates,
            sms_order_updates: data.sms_order_updates,
            restock_alerts: data.restock_alerts,
            new_product_alerts: data.new_product_alerts,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [active]);

  useEffect(() => {
    if (!passwordForm.new_password) {
      setPasswordStrength(0);
      return;
    }
    const password = passwordForm.new_password;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setPasswordStrength(score);
  }, [passwordForm.new_password]);


  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders.filter((order) => {
      const status = order.status?.toLowerCase() ?? "";
      const matchesFilter = orderFilter === "all" || status === orderFilter;
      const matchesSearch =
        !search ||
        order.order_id.toLowerCase().includes(search) ||
        order.items.some((item) => item.product_name.toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const orderCounts = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const counts: Record<string, number> = { all: safeOrders.length };
    safeOrders.forEach((order) => {
      const status = order.status?.toLowerCase() ?? "processing";
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError(null);
      await apiSend("/api/account/profile/update/", "PUT", {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
      });
      const data = await apiGet<Profile>("/api/account/profile/");
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError(null);
      await apiSend("/api/account/change-password/", "POST", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    }
  }

  async function handleBillingSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError(null);
      const gst = normalizeGst(billingForm.gst_number ?? "");
      const businessName = billingForm.business_name.trim();
      const pin = billingForm.billing_pin.replace(/\s+/g, "");

      if (gst && !GST_REGEX.test(gst)) {
        setError("Enter a valid GSTIN (15 characters).");
        return;
      }
      if (gst && !businessName) {
        setError("Business name is required for GST invoices.");
        return;
      }
      if (billingForm.billing_state && !INDIA_STATES.includes(billingForm.billing_state)) {
        setError("Select a valid Indian state.");
        return;
      }
      if (pin && !/^[0-9]{6}$/.test(pin)) {
        setError("Enter a valid 6-digit PIN code.");
        return;
      }

      await apiSend("/api/account/billing/update/", "PUT", {
        ...billingForm,
        gst_number: gst,
        business_name: businessName,
        billing_pin: pin,
      });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(BILLING_DRAFT_KEY);
      }
      billingDraftLoadedRef.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update billing.");
    }
  }

  async function handleVerifyGst() {
    try {
      setError(null);
      setGstLookupLoading(true);
      await apiSend("/api/account/billing/verify-gst/", "POST", {
        gst_number: normalizeGst(billingForm.gst_number ?? ""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "GST verification failed.");
    } finally {
      setGstLookupLoading(false);
    }
  }

  async function handleAddressSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError(null);
      if (editingAddress) {
        await apiSend(`/api/account/addresses/${editingAddress.id}/update/`, "PUT", addressForm);
      } else {
        await apiSend("/api/account/addresses/add/", "POST", addressForm);
      }
      const data = await apiGet<Address[] | { results?: Address[] }>("/api/account/addresses/");
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setAddresses(list);
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save address.");
    }
  }

  async function handleDeleteAddress(id: number) {
    try {
      setError(null);
      await apiSend(`/api/account/addresses/${id}/delete/`, "DELETE");
      const data = await apiGet<Address[] | { results?: Address[] }>("/api/account/addresses/");
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setAddresses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete address.");
    }
  }

  async function handleSetDefault(id: number) {
    try {
      setError(null);
      await apiSend(`/api/account/addresses/${id}/set-default/`, "POST");
      const data = await apiGet<Address[] | { results?: Address[] }>("/api/account/addresses/");
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setAddresses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set default.");
    }
  }

  async function handleNotificationSave(event: React.FormEvent) {
    event.preventDefault();
    try {
      setError(null);
      await apiSend("/api/account/notifications/update/", "PUT", notificationForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save preferences.");
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  function openAddressModal(address?: Address) {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        full_name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 ?? "",
        city: address.city,
        state: address.state,
        pin_code: address.pin_code,
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: "Home",
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pin_code: "",
        is_default: false,
      });
    }
    setAddressModalOpen(true);
  }

  const showSkeleton = loading;

  return (
    <section className="account-section">
      <div className="container">
        <div className="account-tabs">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`account-tab ${active === item.id ? "active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="account-layout">
          <aside className="account-sidebar">
            <div className="account-sidebar-sticky">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`account-nav-item ${active === item.id ? "active" : ""}`}
                  onClick={() => setActive(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>
          <div className="account-content">
            {error ? <div className="alert error">{error}</div> : null}

            {active === "dashboard" && (
              <div className="account-panel">
                <h2>Dashboard</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <p>Total Orders</p>
                        <h3>{summary?.total_orders ?? 0}</h3>
                      </div>
                      <div className="stat-card">
                        <p>Pending Orders</p>
                        <h3>{summary?.pending_orders ?? 0}</h3>
                      </div>
                      <div className="stat-card">
                        <p>Saved Addresses</p>
                        <h3>{summary?.saved_addresses ?? 0}</h3>
                      </div>
                      <div className="stat-card">
                        <p>Profile Completion</p>
                        <h3>{summary?.profile_completion ?? 0}%</h3>
                      </div>
                    </div>

                    <div className="progress-card">
                      <p>Complete Your Profile</p>
                      <div className="progress-bar">
                        <span style={{ width: `${summary?.profile_completion ?? 0}%` }} />
                      </div>
                    </div>

                    <div className="table-card">
                      <div className="toolbar">
                        <h3>Recent Orders</h3>
                      </div>
                      {summary?.recent_orders?.length ? (
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.recent_orders.map((order) => (
                              <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{formatDate(order.date)}</td>
                                <td>
                                  <span className={`badge status ${statusClass(order.status)}`}>
                                    {orderStatusLabel(order.status)}
                                  </span>
                                </td>
                                <td>{formatCurrency(order.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>You haven&apos;t placed any orders yet.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {active === "profile" && (
              <div className="account-panel">
                <h2>My Profile</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <form onSubmit={handleProfileSave} className="form-grid">
                    <div className="field">
                      <label htmlFor="full_name">Full Name</label>
                      <input
                        id="full_name"
                        type="text"
                        value={profileForm.full_name}
                        placeholder="Enter your full name"
                        onChange={(event) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            full_name: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="field input-with-badge">
                      <div style={{ flex: 1 }}>
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={profile?.email ?? ""} disabled />
                      </div>
                      <span
                        className={`status-badge ${
                          profile?.email_verified ? "verified" : "unverified"
                        }`}
                      >
                        {profile?.email_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <div className="field input-with-badge">
                      <div style={{ flex: 1 }}>
                        <label htmlFor="phone">Mobile Number</label>
                        <input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          placeholder="Enter mobile number"
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <span
                        className={`status-badge ${
                          profile?.phone_verified ? "verified" : "unverified"
                        }`}
                      >
                        {profile?.phone_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                    <button className="btn primary" type="submit">
                      Save Changes
                    </button>
                  </form>
                )}
              </div>
            )}

            {active === "password" && (
              <div className="account-panel">
                <h2>Change Password</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <form onSubmit={handleChangePassword} className="form-grid">
                    <div className="form-row">
                      <label htmlFor="current_password">Current Password</label>
                      <input
                        id="current_password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            current_password: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="new_password">New Password</label>
                      <input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            new_password: event.target.value,
                          }))
                        }
                        required
                      />
                      <div className="progress-bar" style={{ height: 6 }}>
                        <span style={{ width: `${Math.min(passwordStrength * 25, 100)}%` }} />
                      </div>
                      <small>
                        {passwordStrength <= 1
                          ? "Weak"
                          : passwordStrength <= 2
                            ? "Medium"
                            : "Strong"}
                      </small>
                    </div>
                    <div className="form-row">
                      <label htmlFor="confirm_password">Confirm New Password</label>
                      <input
                        id="confirm_password"
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirm_password: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <a href="/forgot-password" className="btn-link">
                      Or reset via email OTP
                    </a>
                    <button className="btn primary" type="submit">
                      Save Password
                    </button>
                  </form>
                )}
              </div>
            )}

            {active === "orders" && (
              <div className="account-panel">
                <h2>My Orders</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <>
                    <div className="toolbar">
                      <div className="tabs">
                        {[
                          { key: "all", label: `All (${orderCounts.all ?? 0})` },
                          {
                            key: "pending_payment",
                            label: `Pending Payment (${orderCounts.pending_payment ?? 0})`,
                          },
                          { key: "confirmed", label: `Confirmed (${orderCounts.confirmed ?? 0})` },
                          { key: "processing", label: `Processing (${orderCounts.processing ?? 0})` },
                          { key: "shipped", label: `Shipped (${orderCounts.shipped ?? 0})` },
                          { key: "delivered", label: `Delivered (${orderCounts.delivered ?? 0})` },
                          { key: "cancelled", label: `Cancelled (${orderCounts.cancelled ?? 0})` },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            className={`tab ${orderFilter === tab.key ? "active" : ""}`}
                            onClick={() => setOrderFilter(tab.key)}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <input
                        className="search-input"
                        placeholder="Search order ID or product"
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                      />
                    </div>

                    {filteredOrders.length ? (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                            <Fragment key={order.order_id}>
                              <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{formatDate(order.created_at)}</td>
                                <td>
                                  {order.items
                                    .map((item) => `${item.product_name} x${item.quantity}`)
                                    .join(", ")}
                                </td>
                                <td>{formatCurrency(order.grand_total)}</td>
                                <td>
                                  <span
                                    className={`badge status ${
                                      order.payment_status?.toLowerCase() === "paid"
                                        ? "paid"
                                        : "processing"
                                    }`}
                                  >
                                    {order.payment_status?.toLowerCase() === "paid" ? "Paid" : "Pending"}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge status ${statusClass(order.status)}`}>
                                    {orderStatusLabel(order.status)}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-link"
                                    onClick={() =>
                                      setExpandedOrder((prev) =>
                                        prev === order.order_id ? null : order.order_id,
                                      )
                                    }
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                              {expandedOrder === order.order_id ? (
                                <tr className="order-details-row" key={`${order.order_id}-details`}>
                                  <td colSpan={7}>
                                    <div className="order-details">
                                      <div>
                                        <h4>Items</h4>
                                        {order.items.map((item, index) => (
                                          <p key={`${order.order_id}-${index}`}>
                                            {item.product_name} x{item.quantity} - {formatCurrency(item.line_total)}
                                          </p>
                                        ))}
                                      </div>
                                      <div>
                                        <h4>Shipping Address</h4>
                                        <p>{order.shipping_address_line1}</p>
                                        <p>
                                          {order.shipping_city}, {order.shipping_pin}
                                        </p>
                                        <button type="button" className="btn-outline">
                                          Download Invoice
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>You have no orders yet.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {active === "billing" && (
              <div className="account-panel">
                <h2>Billing & Business Details</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <form onSubmit={handleBillingSave} className="billing-grid">
                    <div>
                      <h3>Billing Information</h3>
                      <div className="form-row">
                        <label>Full Billing Name</label>
                        <input
                          value={billingForm.billing_full_name}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_full_name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>Address Line 1</label>
                        <input
                          value={billingForm.billing_address_line1}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_address_line1: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>Address Line 2</label>
                        <input
                          value={billingForm.billing_address_line2}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_address_line2: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>City</label>
                        <input
                          value={billingForm.billing_city}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_city: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>State</label>
                        <select
                          value={billingForm.billing_state}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_state: event.target.value,
                            }))
                          }
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
                          value={billingForm.billing_pin}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_pin: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                          inputMode="numeric"
                          maxLength={6}
                        />
                      </div>
                      <div className="form-row">
                        <label>Phone</label>
                        <input
                          value={billingForm.billing_phone}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              billing_phone: event.target.value.replace(/\D/g, ""),
                            }))
                          }
                          inputMode="tel"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <h3>Business & GST Info</h3>
                      <div className="form-row">
                        <label>Business Name</label>
                        <input
                          value={billingForm.business_name}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              business_name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>Business Type</label>
                        <select
                          value={billingForm.business_type}
                          onChange={(event) =>
                            setBillingForm((prev) => ({
                              ...prev,
                              business_type: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select type</option>
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row gst-row">
                        <div style={{ flex: 1 }}>
                          <label>GST Number</label>
                          <input
                            value={billingForm.gst_number}
                            onChange={(event) =>
                              setBillingForm((prev) => ({
                                ...prev,
                                gst_number: normalizeGst(event.target.value),
                              }))
                            }
                            maxLength={15}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={handleVerifyGst}
                          disabled={gstLookupLoading || !billingForm.gst_number}
                        >
                          {gstLookupLoading ? "Verifying..." : "Verify GST"}
                        </button>
                      </div>
                      <p className="keyword-note">
                        Business name should match your GST registration. GST details will appear on all invoices automatically.
                      </p>
                      <button className="btn primary" type="submit">
                        Save Billing Details
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {active === "addresses" && (
              <div className="account-panel">
                <div className="toolbar">
                  <h2>Saved Addresses</h2>
                  <button type="button" className="btn primary" onClick={() => openAddressModal()}>
                    + Add New Address
                  </button>
                </div>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : addresses.length ? (
                  <div className="address-grid">
                    {addresses.map((address) => (
                      <div key={address.id} className="address-card">
                        <div className="address-header">
                          <h4>{address.label}</h4>
                          {address.is_default ? (
                            <span className="status-badge verified">Default</span>
                          ) : null}
                        </div>
                        <p>{address.full_name}</p>
                        <p>{address.phone}</p>
                        <p>{address.address_line1}</p>
                        {address.address_line2 ? <p>{address.address_line2}</p> : null}
                        <p>
                          {address.city}, {address.state} {address.pin_code}
                        </p>
                        <div className="address-actions">
                          <button type="button" className="btn-outline" onClick={() => openAddressModal(address)}>
                            Edit
                          </button>
                          <button type="button" className="btn-outline" onClick={() => handleDeleteAddress(address.id)}>
                            Delete
                          </button>
                          {!address.is_default ? (
                            <button type="button" className="btn primary" onClick={() => handleSetDefault(address.id)}>
                              Set as Default
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No saved addresses yet. Add your first address.</p>
                )}
              </div>
            )}

            {active === "notifications" && (
              <div className="account-panel">
                <h2>Notifications & Preferences</h2>
                {showSkeleton ? (
                  <div className="skeleton-grid" />
                ) : (
                  <form onSubmit={handleNotificationSave}>
                    <div className="toggle-list">
                      {[
                        {
                          key: "email_order_updates",
                          label: "Email notifications for order updates",
                        },
                        {
                          key: "sms_order_updates",
                          label: "SMS notifications for order updates",
                        },
                        {
                          key: "restock_alerts",
                          label: "Restock alerts for subscribed products",
                        },
                        {
                          key: "new_product_alerts",
                          label: "New product launch alerts",
                        },
                      ].map((item) => (
                        <label key={item.key} className="toggle-item">
                          <span>{item.label}</span>
                          <span>
                            <input
                              type="checkbox"
                              checked={notificationForm[item.key as keyof Notifications]}
                              onChange={(event) =>
                                setNotificationForm((prev) => ({
                                  ...prev,
                                  [item.key]: event.target.checked,
                                }))
                              }
                            />
                            <span className="toggle-slider" />
                          </span>
                        </label>
                      ))}
                    </div>
                    <button type="submit" className="btn primary" style={{ marginTop: "1rem" }}>
                      Save Preferences
                    </button>
                  </form>
                )}
              </div>
            )}

            {active === "logout" && (
              <div className="account-panel">
                <h2>Logout</h2>
                <p>Are you sure you want to logout?</p>
                <button type="button" className="btn primary" onClick={() => setShowLogout(true)}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {addressModalOpen ? (
        <div className="modal-backdrop" onClick={() => setAddressModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            <form onSubmit={handleAddressSave} className="form-grid">
              <div className="form-row">
                <label>Label</label>
                <input
                  value={addressForm.label}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      label: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-row">
                <label>Full Name</label>
                <input
                  value={addressForm.full_name}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      full_name: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input
                  value={addressForm.phone}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      phone: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  required
                  inputMode="tel"
                  maxLength={10}
                />
              </div>
              <div className="form-row">
                <label>Address Line 1</label>
                <input
                  value={addressForm.address_line1}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      address_line1: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-row">
                <label>Address Line 2</label>
                <input
                  value={addressForm.address_line2}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      address_line2: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-row">
                <label>City</label>
                <input
                  value={addressForm.city}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="form-row">
                <label>State</label>
                <select
                  value={addressForm.state}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      state: event.target.value,
                    }))
                  }
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
                  value={addressForm.pin_code}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      pin_code: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  required
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
              <label className="toggle-item">
                <span>Set as Default</span>
                <span>
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        is_default: event.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider" />
                </span>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setAddressModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showLogout ? (
        <div className="modal-backdrop" onClick={() => setShowLogout(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setShowLogout(false)}>
                Cancel
              </button>
              <button type="button" className="btn primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
