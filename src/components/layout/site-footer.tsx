import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h4>Guru</h4>
          <p>
            Guru offers premium glass jars, bottles, and closures for brands,
            manufacturers, and corporate gifting programs.
          </p>
          <p style={{ marginTop: "0.6rem" }}>
            Plot 14, Industrial Estate, Pune, Maharashtra
          </p>
          <p>Email: sales@gurupackaging.com</p>
          <p>Phone: +91 90000 12345</p>
        </div>
        <div>
          <h4>Useful Links</h4>
          <ul className="inline-list">
            <li>
              <Link href="/products?q=jar">Glass Jars</Link>
            </li>
            <li>
              <Link href="/products?q=bottle">Glass Bottles</Link>
            </li>
            <li>
              <Link href="/products?q=cap">Cap Closures</Link>
            </li>
            <li>
              <Link href="/products?q=gift">Corporate Gifting Jars</Link>
            </li>
            <li>
              <Link href="/about-us">About Us</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Let Us Help You</h4>
          <ul className="inline-list">
            <li>
              <Link href="/account">My Account</Link>
            </li>
            <li>
              <Link href="/orders">Track Orders</Link>
            </li>
            <li>
              <Link href="/contact-us">Contact Us</Link>
            </li>
            <li>
              <Link href="/about-us">About Us</Link>
            </li>
            <li>
              <Link href="#">Policies</Link>
            </li>
            <li>
              <Link href="#">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="#">Download Catalog</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-base">
        <div className="container">
          <p>Copyright {new Date().getFullYear()} Guru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
