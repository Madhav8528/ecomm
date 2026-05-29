"use client";

import Link from "next/link";
import { useState } from "react";

type FormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  product_interest: string;
  quantity_range: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  company: "",
  phone: "",
  email: "",
  product_interest: "",
  quantity_range: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await new Promise((res) => setTimeout(res, 1200));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="contact-form-success">
        <div className="contact-form-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>Enquiry Received!</h3>
        <p>
          Thank you, <strong>{form.name}</strong>. Our sales team will reach out to{" "}
          <strong>{form.email}</strong> within 1 business day.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setForm(INITIAL);
            setAcceptPolicies(false);
            setStatus("idle");
          }}
        >
          Send Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form card" onSubmit={handleSubmit}>
      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="cf-name">Full Name *</label>
          <input
            id="cf-name"
            type="text"
            required
            placeholder="Rahul Sharma"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="cf-company">Company / Brand Name</label>
          <input
            id="cf-company"
            type="text"
            placeholder="Your Brand Pvt. Ltd."
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="cf-phone">Phone / WhatsApp *</label>
          <input
            id="cf-phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="cf-email">Email Address *</label>
          <input
            id="cf-email"
            type="email"
            required
            placeholder="rahul@brand.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="cf-product">Product Interest</label>
          <select
            id="cf-product"
            value={form.product_interest}
            onChange={(e) => set("product_interest", e.target.value)}
          >
            <option value="">- Select a category -</option>
            <option value="glass_jars">Glass Jars (Honey, Spice, Jam etc.)</option>
            <option value="milk_bottles">Milk / Beverage Bottles</option>
            <option value="matki_jars">Matki / Heritage Jars</option>
            <option value="hexagonal_jars">Hexagonal Jars</option>
            <option value="bamboo_jars">Bamboo Lid Jars</option>
            <option value="cap_closures">Cap Closures Only</option>
            <option value="corporate_gifting">Corporate Gifting Sets</option>
            <option value="custom">Custom / OEM Requirement</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="contact-form-field">
          <label htmlFor="cf-qty">Approximate Quantity</label>
          <select
            id="cf-qty"
            value={form.quantity_range}
            onChange={(e) => set("quantity_range", e.target.value)}
          >
            <option value="">- Select range -</option>
            <option value="trial">Trial / Sample Only</option>
            <option value="small">1-10 Boxes</option>
            <option value="medium">10-50 Boxes</option>
            <option value="large">50-200 Boxes</option>
            <option value="bulk">200+ Boxes (Bulk / Wholesale)</option>
          </select>
        </div>
      </div>

      <div className="contact-form-field">
        <label htmlFor="cf-message">Your Requirement / Message *</label>
        <textarea
          id="cf-message"
          required
          rows={4}
          placeholder="Describe your product need - size, shape, closure type, intended use, any special requirements..."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      <label className="contact-policy-consent" htmlFor="cf-policy-consent">
        <input
          id="cf-policy-consent"
          type="checkbox"
          checked={acceptPolicies}
          onChange={(e) => setAcceptPolicies(e.target.checked)}
          required
        />
        <span>
          I have read and agree to the <Link href="/terms-and-conditions">Terms & Conditions</Link> and{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>

      {status === "error" && (
        <p className="form-error">Something went wrong. Please try again or WhatsApp us directly.</p>
      )}

      <button type="submit" className="btn btn-primary contact-form-submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <span className="auth-spinner" /> Sending Enquiry...
          </>
        ) : (
          <>Send Enquiry -&gt;</>
        )}
      </button>

      <p className="contact-form-disclaimer">
        By submitting this form you agree to be contacted by ClearPiece&apos;s sales team. We do
        not share your information with third parties.
      </p>
    </form>
  );
}
