import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ClearPiece - India's Glass People",
  description:
    "ClearPiece is a Firozabad-based glass manufacturer supplying premium jars, bottles, and closures to food, beverage, cosmetics, and gifting brands across India since 1996.",
};

const values = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Uncompromised Quality",
    body: "Every batch goes through dimensional checks, clarity inspection, and stress testing before it leaves our facility. We don't ship glass that we wouldn't use ourselves.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path
          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Built for Brands",
    body: "From startup food brands ordering their first 5 boxes to established FMCG companies running monthly bulk orders - we've structured our process to serve both with the same reliability.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path
          d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Rooted in Firozabad",
    body: "We are not a trading house. We manufacture from Firozabad - India's glass capital - which means direct factory pricing, faster turnaround, and deep material expertise built over decades.",
  },
];

const stats = [
  { value: "1996", label: "Year Established" },
  { value: "30+", label: "Years in Glass" },
  { value: "500+", label: "SKUs Available" },
  { value: "10,000+", label: "Orders Fulfilled" },
  { value: "Pan-India", label: "Delivery Reach" },
];

const industries = [
  { label: "Food & Condiments", icon: "Jar" },
  { label: "Dairy & Beverages", icon: "Milk" },
  { label: "Honey & Preserves", icon: "Honey" },
  { label: "Spices & Dry Goods", icon: "Spice" },
  { label: "Cosmetics & Skincare", icon: "Care" },
  { label: "Wellness & Supplements", icon: "Wellness" },
  { label: "Pharma & Syrups", icon: "Pharma" },
  { label: "Corporate Gifting", icon: "Gift" },
  { label: "Home & Lifestyle", icon: "Home" },
  { label: "Artisan & D2C Brands", icon: "Art" },
  { label: "Exports & OEM", icon: "Export" },
  { label: "Hospitality & Hotels", icon: "Hotel" },
];

export default function AboutUsPage() {
  return (
    <>
      <header className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-text">
            <span className="about-hero-eyebrow">Since 1996 - Firozabad, UP</span>
            <h1>
              Glass That Speaks
              <br />
              Before You Do
            </h1>
            <p>
              The first thing your customer sees is not your product - it's the container.
              ClearPiece has spent three decades making sure that first impression is
              always worth it. We manufacture and supply premium glass jars, bottles, and
              closures to brands across every industry that values what glass stands for:
              purity, premium, and permanence.
            </p>
            <div className="about-hero-actions">
              <Link href="/products" className="btn btn-primary about-hero-btn">
                Browse Our Catalog
              </Link>
              <Link href="/contact-us" className="btn about-hero-btn-secondary">
                Talk to Our Team
              </Link>
            </div>
          </div>
          <div className="about-hero-visual">
            <div className="about-hero-card-stack">
              {stats.map((stat) => (
                <div key={stat.label} className="about-hero-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container about-story-grid">
          <div className="about-story-text">
            <span className="about-section-eyebrow">Our Story</span>
            <h2>Three Decades of Glass, One City, One Craft</h2>
            <p>
              ClearPiece was born in Firozabad - a city that has been India's glass
              manufacturing heart for over a century. What started as a small factory
              operation in 1996 has grown into a full-scale glass supply house serving
              hundreds of brands across India.
            </p>
            <p>
              We've watched the Indian consumer market evolve - from commodity bulk buyers
              to premium D2C brands that care deeply about how their product looks on a
              shelf. That shift changed how we think about glass. It's not just a
              container anymore. It's a statement about your brand's standards.
            </p>
            <p>
              Today, ClearPiece supplies glass to food companies, cosmetics labels,
              pharma manufacturers, corporate gifting houses, and everything in between.
              The common thread: every customer comes to us because they don't want to
              compromise on the vessel that carries their product.
            </p>
          </div>
          <div className="about-story-aside">
            <div className="card about-firozabad-card">
              <div className="about-firozabad-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Why Firozabad?</h3>
              <p>
                Firozabad produces over 70% of India's glass bangles and is home to
                hundreds of glass factories. This concentration means access to raw
                materials, skilled craftsmen, and glass-specific machinery that no other
                city in India can match.
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                When you order from ClearPiece, you're ordering directly from the source
                - not from a middleman distributor.
              </p>
              <div className="about-firozabad-badge">Factory-Direct Pricing</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">What We Stand For</span>
            <h2>The Principles Behind Every Order</h2>
          </div>
          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="card about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">Industries We Serve</span>
            <h2>If Your Business Uses Glass, We Supply It</h2>
            <p className="about-section-sub">
              From artisan jam makers to large FMCG manufacturers - our catalog
              and process is built to serve businesses of every scale and sector.
            </p>
          </div>
          <div className="about-industries-grid">
            {industries.map((ind) => (
              <div key={ind.label} className="about-industry-tag">
                <span className="about-industry-icon">{ind.icon}</span>
                <span>{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">How We Work</span>
            <h2>Simple. Transparent. Reliable.</h2>
          </div>
          <div className="about-process-strip">
            {[
              {
                step: "01",
                title: "Share Your Requirement",
                body: "Tell us what you need - product type, size, quantity, and any customization. Email, WhatsApp, or the enquiry form all work.",
              },
              {
                step: "02",
                title: "We Confirm & Quote",
                body: "Our team reviews your requirement, checks stock availability, and sends you a detailed quote within 1 business day.",
              },
              {
                step: "03",
                title: "Place Your Order",
                body: "Once you're happy with the quote, place the order through our website or directly with our sales team. Minimum order value is Rs 8,000.",
              },
              {
                step: "04",
                title: "Pack, QC & Dispatch",
                body: "We pack your order, run quality checks, and dispatch via transport with LR copy and invoice shared with you directly.",
              },
            ].map((p, i, arr) => (
              <div key={p.step} className="about-process-step">
                <div className="about-process-number" data-step={p.step}>
                  {p.step}
                </div>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
                {i < arr.length - 1 && <div className="about-process-arrow">&gt;</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-cta-block">
            <div className="about-cta-text">
              <h2>Ready to Talk Glass?</h2>
              <p>
                Whether you have a specific product in mind or just want to explore
                what's possible - our team is easy to reach and genuinely helpful.
                No pushy sales, just good conversation about glass.
              </p>
            </div>
            <div className="about-cta-actions">
              <Link href="/contact-us" className="btn btn-primary">
                Get in Touch
              </Link>
              <Link href="/products" className="btn">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
