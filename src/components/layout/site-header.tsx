"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthControls } from "./auth-controls";
import { CartLink } from "./cart-link";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/products?q=jar", label: "Glass Jars" },
  { href: "/products?q=bottle", label: "Glass Bottles" },
  { href: "/products?category=tableware", label: "GLASS TABLEWARE" },
  { href: "/customisation", label: "Customizations" },
  { href: "/products?q=cap", label: "Cap Closure Options" },
  { href: "/products?q=industry", label: "Industry Specific" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about-us", label: "About Us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-header-top">
        <div className="top-offer-banner">The Minimum Order Value is only 8000/- rs !!</div>
        <div className="container header-top">
          <Link href="/" className="brand brand-block">
            <Image
              src="/clearpiece-logo.webp"
              alt="Clearpiece logo"
              width={260}
              height={84}
              className="brand-logo"
              priority
            />
            <span className="brand-subtitle">For Every Glassware Need</span>
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
            <ThemeToggle />
            <AuthControls />
            <CartLink />
          </div>
        </div>
      </div>
      <nav className="main-nav main-nav-sticky">
        <div className="container main-nav-inner">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`main-nav-item ${isActive ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
