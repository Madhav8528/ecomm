import Image from "next/image";
import Link from "next/link";
import { AuthControls } from "./auth-controls";
import { CartLink } from "./cart-link";

const navLinks = [
  { href: "/products?q=jar", label: "Glass Jars" },
  { href: "/products?q=bottle", label: "Glass Bottles" },
  { href: "/products?q=custom", label: "Customizations" },
  { href: "/products?q=cap", label: "Cap Closure Options" },
  { href: "/products?q=industry", label: "Industry Specific" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about-us", label: "About Us" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="top-offer-banner">Minimum order value is 8000</div>
      <div className="container header-top">
        <Link href="/" className="brand brand-block">
          <Image
            src="/guru-logo.svg"
            alt="Guru logo"
            width={54}
            height={54}
            className="brand-logo"
            priority
          />
          <span>
            Guru
            <span className="brand-subtitle">Premium Glass Packaging Solutions</span>
          </span>
        </Link>
        <form action="/products" method="get" className="header-search">
          <input
            type="search"
            name="q"
            placeholder="Search jars, bottles, closures..."
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        <div className="header-actions">
          <AuthControls />
          <CartLink />
        </div>
      </div>
      <nav className="main-nav">
        <div className="container main-nav-inner">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="main-nav-item">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
