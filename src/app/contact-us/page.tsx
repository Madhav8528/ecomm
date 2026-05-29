import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us - ClearPiece Glass",
  description:
    "Get in touch with ClearPiece for bulk glass jar and bottle orders, custom packaging, samples, and trade enquiries. Based in Firozabad, UP.",
};

export default function ContactUsPage() {
  return (
    <>
      <header className="contact-hero">
        <div className="container contact-hero-inner">
          <div className="contact-hero-text">
            <span className="contact-hero-eyebrow">Get In Touch</span>
            <h1>Every Great Product Deserves Great Glass</h1>
            <p>
              Whether you're a food brand, cosmetics label, pharma company, or corporate
              gifting house - if glass is part of your product, we're here to help you
              get it right. Share your requirement and we'll respond within 1 business day.
            </p>
          </div>
          <div className="contact-hero-stats">
            <div className="contact-stat">
              <strong>8,000+</strong>
              <span>Minimum Order Value</span>
            </div>
            <div className="contact-stat">
              <strong>24-48 hrs</strong>
              <span>Response Time</span>
            </div>
            <div className="contact-stat">
              <strong>Since 1996</strong>
              <span>In Glass Manufacturing</span>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="contact-channels">
            <div className="contact-channel-card">
              <div className="contact-channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path
                    d="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Email Sales Team</h3>
              <p>For trade enquiries, bulk pricing, and product availability</p>
              <a href="mailto:sales@clearpiece.in" className="contact-channel-action">
                sales@clearpiece.in
              </a>
              <span className="contact-channel-note">Reply within 1 business day</span>
            </div>

            <div className="contact-channel-card featured">
              <div className="contact-channel-badge">Fastest Response</div>
              <div className="contact-channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path
                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>WhatsApp Us</h3>
              <p>Send photos of your requirement, get instant quotes and samples info</p>
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20bulk%20glass%20packaging%20from%20ClearPiece"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-channel-action whatsapp"
              >
                +91 98765 43210
              </a>
              <span className="contact-channel-note">Mon-Sat, 10am-7pm IST</span>
            </div>

            <div className="contact-channel-card">
              <div className="contact-channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Visit Our Factory</h3>
              <p>Open for trade visits, product sampling, and bulk order discussions</p>
              <address className="contact-channel-action address">
                Glass Nagar, Firozabad
                <br />
                Uttar Pradesh - 283103
              </address>
              <span className="contact-channel-note">By appointment preferred</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container contact-main-grid">
          <div>
            <div className="contact-form-header">
              <h2>Send an Enquiry</h2>
              <p>
                Fill in your requirement and our sales team will reach out with pricing,
                availability, and samples information.
              </p>
            </div>
            <ContactForm />
          </div>

          <aside className="contact-sidebar">
            <div className="card contact-info-card">
              <h3>Office & Factory</h3>
              <div className="contact-info-block">
                <div className="contact-info-row">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M10 18s-7-4-7-10a7 7 0 0114 0c0 6-7 10-7 10z" />
                    <circle cx="10" cy="8" r="2.5" />
                  </svg>
                  <div>
                    <strong>ClearPiece Glass Industries</strong>
                    <p>Plot 14, Glass Nagar Industrial Estate</p>
                    <p>Firozabad, Uttar Pradesh - 283103</p>
                  </div>
                </div>
                <div className="contact-info-row">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path
                      d="M2 4a2 2 0 012-2h2.5l1 4-2 1.5a11 11 0 005 5L12 10l4 1v2.5a2 2 0 01-2 2C7 16 2 9 2 4z"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <strong>+91 98765 43210</strong>
                    <p>Sales & Trade Enquiries</p>
                  </div>
                </div>
                <div className="contact-info-row">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path
                      d="M2.5 6l7.5 5 7.5-5M4 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 014 4z"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <strong>sales@clearpiece.in</strong>
                    <p>For quotes and order queries</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card contact-hours-card">
              <h3>Business Hours</h3>
              <div className="contact-hours-list">
                <div className="contact-hours-row">
                  <span>Monday - Friday</span>
                  <strong>10:00 AM - 7:00 PM</strong>
                </div>
                <div className="contact-hours-row">
                  <span>Saturday</span>
                  <strong>10:00 AM - 5:00 PM</strong>
                </div>
                <div className="contact-hours-row closed">
                  <span>Sunday</span>
                  <strong>Closed</strong>
                </div>
              </div>
              <p className="contact-hours-note">
                All times in IST (Indian Standard Time). WhatsApp responses may be slightly
                delayed on Saturdays.
              </p>
            </div>

            <div className="card contact-quick-card">
              <h3>Quick Facts</h3>
              <ul className="contact-quick-list">
                <li>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Minimum order value Rs 8,000
                </li>
                <li>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Free samples available on request
                </li>
                <li>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Custom printing & labelling supported
                </li>
                <li>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pan-India transport dispatch
                </li>
                <li>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  GST invoicing available
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="contact-faq-title">Common Questions</h2>
          <div className="contact-faq-grid">
            <div className="contact-faq-item">
              <h4>What is the minimum order quantity?</h4>
              <p>
                Our minimum order value is Rs 8,000 before GST. This typically translates
                to 1-3 boxes depending on the product. We don't sell single units.
              </p>
            </div>
            <div className="contact-faq-item">
              <h4>Can I get samples before ordering?</h4>
              <p>
                Yes - we offer product samples for serious buyers. Sample requests are
                reviewed by our team and dispatched within 3-5 working days. Contact us to
                request.
              </p>
            </div>
            <div className="contact-faq-item">
              <h4>Do you support custom branding?</h4>
              <p>
                Absolutely. We support screen printing, paper labels, shrink sleeves, and
                embossing on select products. Share your artwork and we'll advise on the
                best method.
              </p>
            </div>
            <div className="contact-faq-item">
              <h4>How long does delivery take?</h4>
              <p>
                Standard orders are dispatched within 2-5 working days from confirmation.
                Delivery time depends on your location - typically 3-7 days via transport.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
