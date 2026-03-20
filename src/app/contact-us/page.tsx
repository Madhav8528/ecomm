import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactUsPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Reach our sales and support team for orders and customization.</p>
        </div>
      </header>
      <section className="section">
        <div className="container card">
          <p>Email: sales@clearpiece.com</p>
          <p>Phone: +91 90000 12345</p>
          <p>Hours: Mon-Sat, 10:00 AM - 7:00 PM</p>
        </div>
      </section>
    </>
  );
}
